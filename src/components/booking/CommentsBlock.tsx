
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from 'lucide-react';

interface CommentsBlockProps {
  comments: string;
  onCommentsChange: (comments: string) => void;
}

const CommentsBlock: React.FC<CommentsBlockProps> = ({
  comments,
  onCommentsChange
}) => {
  const suggestions = [
    "2 seats needed",
    "No helmet required", 
    "Fragile items",
    "Rush - please hurry",
    "Call when you arrive"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Any notes for the driver?
        </h3>
        
        <Textarea
          placeholder="E.g., 2 seats needed, fragile items, helmet preference..."
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          className="min-h-[100px] mb-4"
        />
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onCommentsChange(comments ? `${comments}, ${suggestion}` : suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full border"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsBlock;
