import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Mic, MicOff, Loader2, X, CheckCircle, Clock, MapPin, Users, Car, Image } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  kind?: 'text' | 'tripCard';
  metadata?: any;
}

export const ChatDrawer = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Load chat history when drawer opens
  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dialog_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
      kind: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/functions/v1/ai-trip-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          message: content,
          action: 'chat'
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantRaw = data.assistant;

      // 1. Regular assistant text response
      if (assistantRaw.content) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          kind: 'text',
          content: assistantRaw.content as string,
          created_at: new Date().toISOString()
        }]);
      }

      // 2. Trip published card
      if (assistantRaw.metadata?.trip_published) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            kind: 'tripCard',
            content: '',
            created_at: new Date().toISOString(),
            metadata: assistantRaw.metadata
          }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!user) return;

    if (isRecording && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;

          try {
            const response = await fetch('/functions/v1/ai-trip-agent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                userId: user.id,
                action: 'voice_to_text',
                data: { audioBase64: base64Audio }
              })
            });

            const data = await response.json();
            if (data.transcription) {
              setInput(data.transcription);
            }
          } catch (error) {
            console.error('Voice transcription error:', error);
            toast({
              title: 'Voice Error',
              description: 'Failed to transcribe voice. Please try again.',
              variant: 'destructive'
            });
          }
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
          size="icon"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <SheetTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>AI Trip Assistant</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Beta
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">
                  Hi! I'm your AI trip assistant. Ask me anything about planning your trips!
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400">Try saying:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setInput("Take me home at 5pm")}
                    >
                      "Take me home at 5pm"
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setInput("I need a ride to the airport tomorrow")}
                    >
                      "Need ride to airport"
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              if (message.kind === 'tripCard' && message.metadata?.summary) {
                const p = message.metadata.summary;
                return (
                  <div key={message.id} className="flex justify-start">
                    <Card className="w-full max-w-xs bg-green-50 border-green-200">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center text-green-700 font-medium"><CheckCircle className="w-4 h-4 mr-1"/>Trip Booked</div>
                        <div className="flex items-start text-sm"><MapPin className="w-3 h-3 mt-0.5 text-gray-500 mr-1"/> {p.origin_text} → {p.dest_text}</div>
                        <div className="flex items-center text-xs text-gray-600 space-x-2">
                          <Clock className="w-3 h-3"/><span>{new Date(p.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          {p.seats && <><Users className="w-3 h-3"/><span>{p.seats}</span></>}
                          {p.vehicle_type && <><Car className="w-3 h-3"/><span className="capitalize">{p.vehicle_type}</span></>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              }

              // default text bubble
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    )}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleVoiceInput}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              disabled={isLoading}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => sendMessage(input)}
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            {/* Image upload */}
            <Button
              size="icon"
              variant="outline"
              disabled={isLoading}
              aria-label="Send image"
              onClick={() => {
                const f = document.createElement('input');
                f.type = 'file';
                f.accept = 'image/*';
                f.onchange = async () => {
                  const file = f.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result?.toString().split(',')[1];
                    if (!base64) return;
                    // send image
                    sendImage(base64);
                  };
                  reader.readAsDataURL(file);
                };
                f.click();
              }}
            >
              <Image className="w-4 h-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm">Recording... Tap to stop</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}; 