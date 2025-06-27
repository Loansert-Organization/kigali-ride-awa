import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign } from 'lucide-react';
import { TripData } from '@/types/api';

interface FareInputBlockProps {
  fareAmount: number;
  paymentMethod: string;
  currency?: string;
  onUpdate: (updates: Partial<TripData>) => void;
}

const FareInputBlock: React.FC<FareInputBlockProps> = ({
  fareAmount,
  paymentMethod,
  currency,
  onUpdate
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          💰 Pricing
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fare per passenger (RWF)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-green-600" />
              <Input
                type="number"
                placeholder="Enter fare (e.g., 2500) or leave empty"
                value={fareAmount || ''}
                onChange={(e) => onUpdate({ fareAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for free rides or to negotiate later
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <div className="font-medium text-blue-900">Negotiable price</div>
              <div className="text-sm text-blue-700">Allow passengers to discuss the fare</div>
            </div>
            <Switch
              checked={paymentMethod === 'negotiable'}
              onCheckedChange={(checked) => onUpdate({ paymentMethod: checked ? 'negotiable' : 'fixed' })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FareInputBlock;
