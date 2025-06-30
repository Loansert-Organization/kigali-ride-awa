import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Search, CheckCircle, Globe } from 'lucide-react';
import { countryDetectionService, CountryInfo } from '@/services/CountryDetectionService';
import { useToast } from '@/hooks/use-toast';

interface CountryStepProps {
  onCountrySelect: (country: CountryInfo) => void;
  onSkip?: () => void;
}

export const CountryStep = ({ onCountrySelect, onSkip }: CountryStepProps) => {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<CountryInfo | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCountries, setShowAllCountries] = useState(false);

  const allCountries = countryDetectionService.getAllSupportedCountries();
  const filteredCountries = searchQuery 
    ? allCountries.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCountries;

  // Auto-detect country on mount
  useEffect(() => {
    handleAutoDetect();
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    
    try {
      // Try GPS-based detection first
      const locationResult = await countryDetectionService.detectCountryFromLocation();
      
      if (locationResult?.country) {
        setDetectedCountry(locationResult.country);
        setSelectedCountry(locationResult.country);
        toast({
          title: "Country Detected",
          description: `We detected you're in ${locationResult.country.name}`,
        });
      } else {
        // Fallback to IP-based detection
        const ipCountry = await countryDetectionService.detectCountryFromIP();
        if (ipCountry) {
          setDetectedCountry(ipCountry);
          setSelectedCountry(ipCountry);
          toast({
            title: "Country Detected",
            description: `We detected you're in ${ipCountry.name}`,
          });
        } else {
          toast({
            title: "Auto-detection Failed",
            description: "Please select your country manually",
            variant: "destructive"
          });
          setShowAllCountries(true);
        }
      }
    } catch (error) {
      console.error('Country detection error:', error);
      toast({
        title: "Detection Failed",
        description: "Please select your country manually",
        variant: "destructive"
      });
      setShowAllCountries(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    onCountrySelect(country);
  };

  const handleConfirmDetected = () => {
    if (selectedCountry) {
      onCountrySelect(selectedCountry);
    }
  };

  const handleManualSelection = () => {
    setShowAllCountries(true);
  };

  if (isDetecting) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Detecting Your Location</h3>
          <p className="text-gray-600 text-sm">
            We're identifying your country to provide the best experience...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (detectedCountry && !showAllCountries) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>Confirm Your Country</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-2">{detectedCountry.flag}</div>
            <h3 className="text-xl font-bold">{detectedCountry.name}</h3>
            <Badge variant="secondary" className="mt-2">
              Currency: {detectedCountry.currency}
            </Badge>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleConfirmDetected}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Yes, I'm in {detectedCountry.name}
            </Button>
            
            <Button 
              onClick={handleManualSelection}
              variant="outline"
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Choose Different Country
            </Button>
          </div>

          {onSkip && (
            <Button 
              onClick={onSkip}
              variant="ghost"
              className="w-full text-sm text-gray-500"
            >
              Skip for now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <span>Select Your Country</span>
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          Choose your country to get localized pricing and features
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search for your country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Try Auto-detect Again */}
        {showAllCountries && (
          <Button 
            onClick={handleAutoDetect}
            variant="outline"
            className="w-full"
            disabled={isDetecting}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Try Auto-Detect Again
          </Button>
        )}

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredCountries.map((country) => (
            <Button
              key={country.code}
              onClick={() => handleCountrySelect(country)}
              variant={selectedCountry?.code === country.code ? "default" : "outline"}
              className="h-auto p-4 justify-start text-left"
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.currency}</div>
                </div>
                {selectedCountry?.code === country.code && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No countries found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Unsupported Country Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Don't see your country?</strong> We currently support Sub-Saharan African countries (excluding Kenya, Uganda, Nigeria, and South Africa). More countries coming soon!
          </p>
        </div>

        {onSkip && (
          <Button 
            onClick={onSkip}
            variant="ghost"
            className="w-full text-sm text-gray-500"
          >
            Skip for now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 