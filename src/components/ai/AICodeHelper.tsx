
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Code, Bug, FileText, Copy, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AICodeHelperProps {
  code?: string;
  error?: string;
  context?: string;
  className?: string;
}

const AICodeHelper: React.FC<AICodeHelperProps> = ({ code, error, context, className }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAction = async (action: 'fix' | 'explain' | 'improve') => {
    setLoading(true);
    try {
      let prompt = '';
      let taskType = 'fix-code';

      switch (action) {
        case 'fix':
          prompt = `Fix this code issue:\n\nError: ${error}\n\nCode:\n${code}`;
          taskType = 'fix-code';
          break;
        case 'explain':
          prompt = `Explain this code in simple terms:\n\n${code}`;
          taskType = 'docs';
          break;
        case 'improve':
          prompt = `Suggest improvements for this code:\n\n${code}`;
          taskType = 'code-generation';
          break;
      }

      const { data, error: apiError } = await supabase.functions.invoke('ai-router', {
        body: {
          taskType,
          prompt,
          context: context || 'React TypeScript component'
        }
      });

      if (apiError) throw apiError;

      setResult(data);
      toast({
        title: "AI Code Helper",
        description: `${action} completed successfully`,
      });
    } catch (error) {
      console.error('AI Code Helper Error:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} code`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('fix')}
            disabled={loading || !code}
          >
            <Bug className="w-4 h-4 mr-1" />
            Fix with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Use AI to fix code errors and issues
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('explain')}
            disabled={loading || !code}
          >
            <FileText className="w-4 h-4 mr-1" />
            Explain
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Get AI explanation of the code
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('improve')}
            disabled={loading || !code}
          >
            <Code className="w-4 h-4 mr-1" />
            Improve
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Get AI suggestions for improvements
        </TooltipContent>
      </Tooltip>

      {result && (
        <Card className="w-full mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">AI Suggestion</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(result.result)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-64">
              {result.result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AICodeHelper;
