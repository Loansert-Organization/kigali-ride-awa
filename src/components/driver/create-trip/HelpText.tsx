
import { Card, CardContent } from "@/components/ui/card";
import { Info, Lightbulb } from 'lucide-react';

interface HelpTextProps {
  tips?: string[];
}

const HelpText: React.FC<HelpTextProps> = ({
  tips = [
    "Set competitive fares to attract more passengers",
    "Be flexible with pickup locations for better matches",
    "Post trips in advance for planned journeys",
    "Keep your vehicle information up to date"
  ]
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-2">Driver Tips</h4>
            <ul className="space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                  <Lightbulb className="w-3 h-3 mt-0.5 text-blue-600" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpText;
