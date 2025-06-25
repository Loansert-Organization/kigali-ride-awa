
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Code, Globe, Shield, FileText, Wand2 } from 'lucide-react';
import AIAssistant from '@/components/ai/AIAssistant';
import AICodeHelper from '@/components/ai/AICodeHelper';
import AILocalizer from '@/components/ai/AILocalizer';

const AIDevTools = () => {
  const [activeTab, setActiveTab] = useState('assistant');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Developer Tools
          </h1>
          <p className="text-blue-100">
            Multi-model AI assistant powered by GPT-4o, Claude-4, and Gemini 2.5 Pro
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Assistant
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Helper
            </TabsTrigger>
            <TabsTrigger value="localize" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Localizer
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Multi-Model AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIAssistant context="Kigali Ride Platform Development" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  AI Code Helper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AICodeHelper 
                  code="// Paste your code here to get AI assistance"
                  context="React TypeScript Component"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  AI Localizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AILocalizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  AI Documentation Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate comprehensive documentation using AI
                </p>
                <AIAssistant 
                  defaultTask="docs"
                  context="Generate technical documentation for Kigali Ride Platform"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4" />
                GPT-4o
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Fast, versatile AI for general tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wand2 className="w-4 h-4" />
                Claude-4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Deep reasoning for complex problems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                Gemini 2.5 Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Google-native with strong safety</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDevTools;
