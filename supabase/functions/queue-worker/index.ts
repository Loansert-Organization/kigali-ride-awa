
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types for better type safety
interface QueueTask {
  id?: string;
  task_type: string;
  payload: Record<string, any>;
  timestamp?: string;
  priority?: number;
  retry_count?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface WorkerResponse {
  success: boolean;
  message?: string;
  processed_tasks?: number;
  errors?: string[];
  execution_time_ms?: number;
}

class QueueWorkerError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'QueueWorkerError';
  }
}

class QueueWorker {
  private supabase;
  private startTime: number;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    this.startTime = Date.now();
  }

  async handleRequest(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const executionStart = Date.now();
    
    try {
      console.log(`Queue worker received: ${JSON.stringify({
        method: request.method,
        url: request.url,
        contentType: request.headers.get('content-type'),
        contentLength: request.headers.get('content-length')
      })}`);

      // Validate HTTP method
      if (request.method !== 'POST') {
        throw new QueueWorkerError(
          `Method ${request.method} not allowed`, 
          'METHOD_NOT_ALLOWED', 
          405
        );
      }

      // Parse request body with proper error handling
      const body = await this.parseRequestBody(request);
      console.log(`Parsed request body:`, body);

      // Process the request
      const result = await this.processRequest(body);
      
      const executionTime = Date.now() - executionStart;
      result.execution_time_ms = executionTime;

      console.log(`Queue worker completed successfully in ${executionTime}ms:`, result);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Execution-Time': executionTime.toString()
        }
      });

    } catch (error) {
      return this.handleError(error, Date.now() - executionStart);
    }
  }

  private async parseRequestBody(request: Request): Promise<Partial<QueueTask>> {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const text = await request.text();
        
        // Handle empty body
        if (!text || text.trim() === '') {
          console.log('Empty request body received');
          return {};
        }

        // Handle minimal JSON like "{}"
        const parsed = JSON.parse(text);
        if (Object.keys(parsed).length === 0) {
          console.log('Empty JSON object received');
          return {};
        }

        return parsed;
      } else {
        console.log(`Unsupported content type: ${contentType}`);
        return {};
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new QueueWorkerError(
          'Invalid JSON in request body', 
          'INVALID_JSON', 
          400
        );
      }
      throw new QueueWorkerError(
        'Failed to parse request body', 
        'PARSE_ERROR', 
        400
      );
    }
  }

  private async processRequest(body: Partial<QueueTask>): Promise<WorkerResponse> {
    // Case 1: Specific task provided
    if (body.task_type && body.payload) {
      console.log(`Processing specific task: ${body.task_type}`);
      return await this.processSpecificTask(body as QueueTask);
    }

    // Case 2: Empty request - check for pending work
    console.log('No specific task provided, checking for pending work...');
    return await this.processPendingTasks();
  }

  private async processSpecificTask(task: QueueTask): Promise<WorkerResponse> {
    try {
      switch (task.task_type) {
        case 'send_whatsapp_otp':
          return await this.handleWhatsAppOTP(task.payload);
        case 'send_whatsapp_notification':
          return await this.handleWhatsAppNotification(task.payload);
        case 'cleanup_expired':
          return await this.processCleanup(task);
        default:
          throw new QueueWorkerError(
            `Unknown task type: ${task.task_type}`, 
            'UNKNOWN_TASK_TYPE', 
            400
          );
      }
    } catch (error) {
      console.error(`Error processing task ${task.task_type}:`, error);
      
      // Update task status to failed if it has an ID
      if (task.id) {
        await this.updateTaskStatus(task.id, 'failed', error.message);
      }
      
      throw error;
    }
  }

  private async processPendingTasks(): Promise<WorkerResponse> {
    try {
      console.log('Checking for pending OTP codes...');

      // Check for pending OTP codes that need to be sent
      const { data: pendingOTPs, error: otpError } = await this.supabase
        .from('otp_codes')
        .select('*')
        .eq('sent', false)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .limit(10);

      if (otpError) {
        console.error('Error fetching pending OTPs:', otpError);
        throw new Error(`OTP fetch error: ${otpError.message}`);
      }

      let processed = 0;
      if (pendingOTPs && pendingOTPs.length > 0) {
        console.log(`Found ${pendingOTPs.length} pending OTP codes to process`);
        for (const otp of pendingOTPs) {
          try {
            const result = await this.handleWhatsAppOTP({
              phone_number: otp.phone_number,
              user_id: otp.user_id,
              otp_code: otp.otp_code
            });
            
            if (result.success) {
              processed++;
            } else {
              console.error('Failed to process OTP:', otp.id, result.message);
            }
          } catch (error) {
            console.error('Failed to process OTP:', otp.id, error);
          }
        }
      } else {
        console.log('No pending OTP codes found');
      }

      return {
        success: true,
        message: 'Queue check completed',
        processed_tasks: processed
      };

    } catch (error) {
      throw new QueueWorkerError(
        `Failed to process pending tasks: ${error.message}`, 
        'PENDING_TASKS_ERROR'
      );
    }
  }

  private async handleWhatsAppOTP(payload: any): Promise<WorkerResponse> {
    try {
      const { phone_number, user_id, otp_code } = payload;

      console.log('Processing WhatsApp OTP:', {
        phone_number,
        user_id,
        otp_code: otp_code ? 'provided' : 'will_generate',
        timestamp: new Date().toISOString()
      });

      if (!phone_number) {
        throw new Error('Phone number is required');
      }

      // Generate OTP code if not provided
      const otpCode = otp_code || Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP code in database if not already stored
      if (!otp_code) {
        const { error: otpError } = await this.supabase
          .from('otp_codes')
          .insert({
            phone_number: phone_number,
            otp_code: otpCode,
            user_id: user_id,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
            sent: false,
            used: false
          });

        if (otpError) {
          console.error('Failed to store OTP:', otpError);
          throw new Error(`Failed to store OTP: ${otpError.message}`);
        }
      }

      // Call the send-whatsapp-template function
      try {
        console.log('Invoking send-whatsapp-template function...');
        
        const { data, error } = await this.supabase.functions.invoke('send-whatsapp-template', {
          body: {
            phone_number: phone_number,
            user_id: user_id
          }
        });

        console.log('WhatsApp template function response:', { data, error });

        if (error) {
          console.error('send-whatsapp-template function error:', error);
          throw new Error(`WhatsApp template function error: ${JSON.stringify(error)}`);
        }

        if (data?.success) {
          // Mark OTP as sent
          const { error: updateError } = await this.supabase
            .from('otp_codes')
            .update({ sent: true })
            .eq('phone_number', phone_number)
            .eq('otp_code', otpCode);

          if (updateError) {
            console.error('Failed to update OTP sent status:', updateError);
          }

          console.log('WhatsApp OTP sent successfully:', {
            messageId: data.messageId,
            method: data.method,
            phone_number
          });

          return {
            success: true,
            message: 'WhatsApp OTP sent successfully',
            processed_tasks: 1
          };
        } else {
          throw new Error(`WhatsApp template function failed: ${data?.error || 'Unknown error'}`);
        }

      } catch (invokeError) {
        console.error('Failed to invoke send-whatsapp-template:', invokeError);
        throw new Error(`Function invocation failed: ${invokeError.message}`);
      }

    } catch (error) {
      console.error('WhatsApp OTP handler error:', {
        error: error.message,
        stack: error.stack,
        payload,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        message: `WhatsApp OTP processing failed: ${error.message}`,
        processed_tasks: 0
      };
    }
  }

  private async handleWhatsAppNotification(payload: any): Promise<WorkerResponse> {
    try {
      const { phone_number, message, user_id } = payload;

      console.log('Processing WhatsApp notification:', {
        phone_number,
        user_id,
        messageLength: message?.length,
        timestamp: new Date().toISOString()
      });

      if (!phone_number || !message) {
        throw new Error('Phone number and message are required');
      }

      // Check environment variables
      const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
      const PHONE_NUMBER_ID = '396791596844039'; // Updated Phone Number ID
      
      if (!WHATSAPP_TOKEN) {
        console.error('WhatsApp credentials missing:', {
          hasToken: !!WHATSAPP_TOKEN,
          phoneNumberId: PHONE_NUMBER_ID
        });
        throw new Error('WhatsApp API credentials not configured');
      }

      // Format phone number (remove + if present)
      const formattedPhone = phone_number.replace('+', '');
      
      console.log('Sending WhatsApp notification:', {
        to: formattedPhone,
        phoneNumberId: PHONE_NUMBER_ID,
        messagePreview: message.substring(0, 50) + '...'
      });

      const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      const whatsappResult = await whatsappResponse.json();

      console.log('WhatsApp API response:', {
        status: whatsappResponse.status,
        statusText: whatsappResponse.statusText,
        result: whatsappResult
      });

      if (!whatsappResponse.ok) {
        console.error('WhatsApp notification failed:', {
          status: whatsappResponse.status,
          error: whatsappResult.error,
          phone: formattedPhone
        });
        throw new Error(`WhatsApp notification failed: ${whatsappResult.error?.message || 'Unknown error'}`);
      }

      console.log('WhatsApp notification sent successfully:', whatsappResult);

      return {
        success: true,
        message: 'WhatsApp notification sent successfully',
        processed_tasks: 1
      };

    } catch (error) {
      console.error('WhatsApp notification handler error:', {
        error: error.message,
        stack: error.stack,
        payload,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        message: `WhatsApp notification processing failed: ${error.message}`,
        processed_tasks: 0
      };
    }
  }

  private async processCleanup(task: QueueTask): Promise<WorkerResponse> {
    console.log('Processing cleanup task:', task.payload);
    
    // Your cleanup logic here
    return {
      success: true,
      message: 'Cleanup completed successfully',
      processed_tasks: 1
    };
  }

  private async updateTaskStatus(taskId: string, status: string, error_message?: string): Promise<void> {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (error_message) {
        updateData.error_message = error_message;
        updateData.retry_count = this.supabase.raw('COALESCE(retry_count, 0) + 1');
      }

      const { error } = await this.supabase
        .from('queue_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error(`Failed to update task ${taskId} status:`, error);
      }
    } catch (error) {
      console.error(`Error updating task status:`, error);
    }
  }

  private handleError(error: any, executionTime: number): Response {
    console.error('Queue worker error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      executionTime
    });

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (error instanceof QueueWorkerError) {
      statusCode = error.statusCode;
      errorCode = error.code;
      message = error.message;
    } else if (error.name === 'TypeError') {
      statusCode = 400;
      errorCode = 'TYPE_ERROR';
      message = 'Invalid request format';
    }

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: message,
        execution_time_ms: executionTime
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Error-Code': errorCode,
        'X-Execution-Time': executionTime.toString()
      }
    });
  }
}

// Main handler
serve(async (req) => {
  const worker = new QueueWorker();
  return await worker.handleRequest(req);
});
