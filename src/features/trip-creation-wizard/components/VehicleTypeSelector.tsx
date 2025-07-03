import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VehicleOption {
  icon: string;
  label: string;
  value: string;
  description: string;
  priceRange: string;
}

interface VehicleTypeSelectorProps {
  label: string;
  value?: string;
  onSelect: (vehicleType: string) => void;
}

const vehicleOptions: VehicleOption[] = [
  {
    icon: "🛵",
    label: "Moto",
    value: "moto",
    description: "1 passenger",
    priceRange: "500-1000 RWF"
  },
  {
    icon: "🚗",
    label: "Car",
    value: "car", 
    description: "1-4 passengers",
    priceRange: "1500-3000 RWF"
  },
  {
    icon: "🚐",
    label: "Van",
    value: "van",
    description: "1-14 passengers",
    priceRange: "3000-8000 RWF"
  }
];

export const VehicleTypeSelector = ({ label, value, onSelect }: VehicleTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center gap-2">
        🚘 {label}
      </Label>
      
      <div className="grid grid-cols-1 gap-3">
        {vehicleOptions.map((option) => (
          <Card 
            key={option.value}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              value === option.value 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelect(option.value)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-base">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {option.priceRange}
                  </Badge>
                </div>
              </div>
              
              {value === option.value && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};