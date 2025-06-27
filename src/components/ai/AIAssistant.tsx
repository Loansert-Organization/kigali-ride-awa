
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Zap } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: { query, context: 'assistant' }
      });

      if (error) throw error;
      
      setResponse(data.response || 'No response received');
      toast({
        title: "AI Response Generated",
        description: "Your query has been processed"
      });
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Question</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about the Kigali Ride platform..."
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">AI Response</label>
            <Textarea
              value={response}
              readOnly
              className="min-h-32 bg-gray-50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
