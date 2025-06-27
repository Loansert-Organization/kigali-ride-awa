
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin } from 'lucide-react';

interface CreateTripHeaderProps {
  title?: string;
  subtitle?: string;
}

const CreateTripHeader: React.FC<CreateTripHeaderProps> = ({
  title = "Create New Trip",
  subtitle = "Post where you're going and pick up passengers along the way"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="w-6 h-6 text-blue-600" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-green-600 mt-1" />
          <div>
            <p className="text-gray-600">{subtitle}</p>
            <p className="text-sm text-gray-500 mt-1">
              Set your route, schedule, and fare to connect with passengers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTripHeader;
