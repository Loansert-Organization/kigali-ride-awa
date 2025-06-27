
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  status: 'pending' | 'success' | 'error';
}

const AICodeHelper: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI code generation
    setTimeout(() => {
      const newSuggestion: CodeSuggestion = {
        id: Date.now().toString(),
        title: 'Component Solution',
        description: `Generated code for: ${prompt}`,
        code: `// Generated code for: ${prompt}\nconst ExampleComponent = () => {\n  return <div>Hello World</div>;\n};`,
        language: 'typescript',
        status: 'success'
      };
      
      setSuggestions(prev => [newSuggestion, ...prev]);
      setPrompt('');
      setIsLoading(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="w-5 h-5 mr-2" />
            AI Code Helper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the code you need help with or want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          
          <Button
            onClick={handleGenerateCode}
            disabled={!prompt.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(suggestion.status)}
                  <h3 className="font-semibold">{suggestion.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(suggestion.status)}>
                    {suggestion.status}
                  </Badge>
                  <Badge variant="outline">
                    {suggestion.language}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre><code>{suggestion.code}</code></pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No code suggestions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Enter a prompt above to generate code suggestions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AICodeHelper;
