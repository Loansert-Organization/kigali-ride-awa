
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Bug, Globe, Shield, Wand2, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  context?: string;
  defaultTask?: string;
  onResult?: (result: any) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context, defaultTask, onResult }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedTask, setSelectedTask] = useState(defaultTask || 'code-generation');
  const [preferredModel, setPreferredModel] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const taskTypes = [
    { value: 'code-generation', label: 'Generate Code', icon: Code },
    { value: 'fix-code', label: 'Fix Code', icon: Bug },
    { value: 'localize', label: 'Localize Text', icon: Globe },
    { value: 'fraud-check', label: 'Fraud Check', icon: Shield },
    { value: 'docs', label: 'Generate Docs', icon: Wand2 },
  ];

  const models = [
    { value: 'auto', label: 'Auto Select' },
    { value: 'gpt-4o', label: 'GPT-4o (Fast)' },
    { value: 'claude', label: 'Claude (Deep)' },
    { value: 'gemini', label: 'Gemini (Google)' },
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Please describe what you need help with",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          taskType: selectedTask,
          prompt,
          context: context || 'Kigali Ride booking app',
          preferredModel: preferredModel === 'auto' ? null : preferredModel
        }
      });

      if (error) throw error;

      setResult(data);
      onResult?.(data);
      
      toast({
        title: "AI Assistant",
        description: `Task completed using ${data.model}`,
      });
    } catch (error) {
      console.error('AI Assistant Error:', error);
      toast({
        title: "AI Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const TaskIcon = taskTypes.find(t => t.value === selectedTask)?.icon || Brain;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Assistant
          <Badge variant="secondary">Multi-Model</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Task Type</label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map(task => {
                  const Icon = task.icon;
                  return (
                    <SelectItem key={task.value} value={task.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {task.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">AI Model</label>
            <Select value={preferredModel} onValueChange={setPreferredModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you need help with..."
            rows={4}
            className="resize-none"
          />
        </div>

        {context && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Context:</strong> {context}
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <TaskIcon className="w-4 h-4 mr-2" />
              Run AI Task
            </>
          )}
        </Button>

        {result && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Result
                <Badge variant="outline">{result.model}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-64">
                {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
