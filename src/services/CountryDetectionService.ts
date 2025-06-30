import { googleMapsService } from './GoogleMapsService';

// Sub-Saharan African countries (excluding Kenya, Uganda, Nigeria, South Africa)
export const SUPPORTED_COUNTRIES = {
  // West Africa
  'GH': { name: 'Ghana', code: 'GH', currency: 'GHS', flag: '🇬🇭', center: { lat: 7.9465, lng: -1.0232 } },
  'SN': { name: 'Senegal', code: 'SN', currency: 'XOF', flag: '🇸🇳', center: { lat: 14.7167, lng: -17.4677 } },
  'ML': { name: 'Mali', code: 'ML', currency: 'XOF', flag: '🇲🇱', center: { lat: 17.5707, lng: -3.9962 } },
  'BF': { name: 'Burkina Faso', code: 'BF', currency: 'XOF', flag: '🇧🇫', center: { lat: 12.2383, lng: -1.5616 } },
  'CI': { name: 'Côte d\'Ivoire', code: 'CI', currency: 'XOF', flag: '🇨🇮', center: { lat: 7.5400, lng: -5.5471 } },
  'LR': { name: 'Liberia', code: 'LR', currency: 'LRD', flag: '🇱🇷', center: { lat: 6.4281, lng: -9.4295 } },
  'SL': { name: 'Sierra Leone', code: 'SL', currency: 'SLL', flag: '🇸🇱', center: { lat: 8.4606, lng: -11.7799 } },
  'GW': { name: 'Guinea-Bissau', code: 'GW', currency: 'XOF', flag: '🇬🇼', center: { lat: 11.8037, lng: -15.1804 } },
  'GN': { name: 'Guinea', code: 'GN', currency: 'GNF', flag: '🇬🇳', center: { lat: 9.9456, lng: -9.6966 } },
  'TG': { name: 'Togo', code: 'TG', currency: 'XOF', flag: '🇹🇬', center: { lat: 8.6195, lng: 0.8248 } },
  'BJ': { name: 'Benin', code: 'BJ', currency: 'XOF', flag: '🇧🇯', center: { lat: 9.3077, lng: 2.3158 } },

  // Central Africa
  'CM': { name: 'Cameroon', code: 'CM', currency: 'XAF', flag: '🇨🇲', center: { lat: 7.3697, lng: 12.3547 } },
  'CF': { name: 'Central African Republic', code: 'CF', currency: 'XAF', flag: '🇨🇫', center: { lat: 6.6111, lng: 20.9394 } },
  'TD': { name: 'Chad', code: 'TD', currency: 'XAF', flag: '🇹🇩', center: { lat: 15.4542, lng: 18.7322 } },
  'CG': { name: 'Republic of the Congo', code: 'CG', currency: 'XAF', flag: '🇨🇬', center: { lat: -0.2280, lng: 15.8277 } },
  'CD': { name: 'Democratic Republic of the Congo', code: 'CD', currency: 'CDF', flag: '🇨🇩', center: { lat: -4.0383, lng: 21.7587 } },
  'GQ': { name: 'Equatorial Guinea', code: 'GQ', currency: 'XAF', flag: '🇬🇶', center: { lat: 1.6508, lng: 10.2679 } },
  'GA': { name: 'Gabon', code: 'GA', currency: 'XAF', flag: '🇬🇦', center: { lat: -0.8037, lng: 11.6094 } },

  // East Africa (excluding Kenya, Uganda)
  'RW': { name: 'Rwanda', code: 'RW', currency: 'RWF', flag: '🇷🇼', center: { lat: -1.9403, lng: 29.8739 } },
  'BI': { name: 'Burundi', code: 'BI', currency: 'BIF', flag: '🇧🇮', center: { lat: -3.3731, lng: 29.9189 } },
  'TZ': { name: 'Tanzania', code: 'TZ', currency: 'TZS', flag: '🇹🇿', center: { lat: -6.3690, lng: 34.8888 } },
  'ET': { name: 'Ethiopia', code: 'ET', currency: 'ETB', flag: '🇪🇹', center: { lat: 9.1450, lng: 40.4897 } },
  'ER': { name: 'Eritrea', code: 'ER', currency: 'ERN', flag: '🇪🇷', center: { lat: 15.1794, lng: 39.7823 } },
  'DJ': { name: 'Djibouti', code: 'DJ', currency: 'DJF', flag: '🇩🇯', center: { lat: 11.8251, lng: 42.5903 } },
  'SO': { name: 'Somalia', code: 'SO', currency: 'SOS', flag: '🇸🇴', center: { lat: 5.1521, lng: 46.1996 } },

  // Southern Africa (excluding South Africa)
  'BW': { name: 'Botswana', code: 'BW', currency: 'BWP', flag: '🇧🇼', center: { lat: -22.3285, lng: 24.6849 } },
  'LS': { name: 'Lesotho', code: 'LS', currency: 'LSL', flag: '🇱🇸', center: { lat: -29.6100, lng: 28.2336 } },
  'SZ': { name: 'Eswatini', code: 'SZ', currency: 'SZL', flag: '🇸🇿', center: { lat: -26.5225, lng: 31.4659 } },
  'NA': { name: 'Namibia', code: 'NA', currency: 'NAD', flag: '🇳🇦', center: { lat: -22.9576, lng: 18.4904 } },
  'ZW': { name: 'Zimbabwe', code: 'ZW', currency: 'ZWL', flag: '🇿🇼', center: { lat: -19.0154, lng: 29.1549 } },
  'ZM': { name: 'Zambia', code: 'ZM', currency: 'ZMW', flag: '🇿🇲', center: { lat: -13.1339, lng: 27.8493 } },
  'MW': { name: 'Malawi', code: 'MW', currency: 'MWK', flag: '🇲🇼', center: { lat: -13.2543, lng: 34.3015 } },
  'MZ': { name: 'Mozambique', code: 'MZ', currency: 'MZN', flag: '🇲🇿', center: { lat: -18.6657, lng: 35.5296 } },
  'MG': { name: 'Madagascar', code: 'MG', currency: 'MGA', flag: '🇲🇬', center: { lat: -18.7669, lng: 46.8691 } },
  'MU': { name: 'Mauritius', code: 'MU', currency: 'MUR', flag: '🇲🇺', center: { lat: -20.3484, lng: 57.5522 } },
  'SC': { name: 'Seychelles', code: 'SC', currency: 'SCR', flag: '🇸🇨', center: { lat: -4.6796, lng: 55.4920 } },
};

export interface CountryInfo {
  name: string;
  code: string;
  currency: string;
  flag: string;
  center: { lat: number; lng: number };
}

export interface LocationResult {
  country?: CountryInfo;
  city?: string;
  coords: { lat: number; lng: number };
  address: string;
}

class CountryDetectionService {
  async detectCountryFromLocation(): Promise<LocationResult | null> {
    try {
      // Get user's current position
      const position = await googleMapsService.getCurrentPosition();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Reverse geocode to get country information
      const results = await googleMapsService.geocode({ location: coords });
      
      if (results.length === 0) {
        return null;
      }

      const result = results[0];
      let countryCode: string | undefined;
      let city: string | undefined;

      // Extract country code and city from address components
      for (const component of result.address_components) {
        if (component.types.includes('country')) {
          countryCode = component.short_name;
        }
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
          city = component.long_name;
        }
      }

      // Check if country is supported
      const country = countryCode ? SUPPORTED_COUNTRIES[countryCode as keyof typeof SUPPORTED_COUNTRIES] : undefined;

      return {
        country,
        city,
        coords,
        address: result.formatted_address
      };

    } catch (error) {
      console.error('Country detection failed:', error);
      return null;
    }
  }

  async detectCountryFromIP(): Promise<CountryInfo | null> {
    try {
      // Fallback: Use IP-based geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code) {
        const country = SUPPORTED_COUNTRIES[data.country_code as keyof typeof SUPPORTED_COUNTRIES];
        return country || null;
      }
      
      return null;
    } catch (error) {
      console.error('IP-based country detection failed:', error);
      return null;
    }
  }

  getCountryByCode(code: string): CountryInfo | undefined {
    return SUPPORTED_COUNTRIES[code as keyof typeof SUPPORTED_COUNTRIES];
  }

  getAllSupportedCountries(): CountryInfo[] {
    return Object.values(SUPPORTED_COUNTRIES);
  }

  isSupportedCountry(countryCode: string): boolean {
    return countryCode in SUPPORTED_COUNTRIES;
  }

  getDefaultPricePerKm(countryCode: string): number {
    // Price per km in local currency - rough estimates
    const priceMap: Record<string, number> = {
      // West Africa (XOF countries use similar rates)
      'GH': 3, 'SN': 500, 'ML': 500, 'BF': 500, 'CI': 500, 'TG': 500, 'BJ': 500, 'GW': 500,
      'LR': 50, 'SL': 25, 'GN': 25,
      
      // Central Africa
      'CM': 500, 'CF': 500, 'TD': 500, 'CG': 500, 'GA': 500, 'GQ': 500,
      'CD': 2000,
      
      // East Africa
      'RW': 150, 'BI': 3000, 'TZ': 2500, 'ET': 50, 'ER': 30, 'DJ': 200, 'SO': 600,
      
      // Southern Africa
      'BW': 12, 'LS': 20, 'SZ': 15, 'NA': 15, 'ZW': 500, 'ZM': 25, 'MW': 800, 'MZ': 70, 'MG': 4000, 'MU': 40, 'SC': 25
    };
    
    return priceMap[countryCode] || 100; // Default fallback
  }

  getCurrencySymbol(currencyCode: string): string {
    const symbolMap: Record<string, string> = {
      'GHS': '₵', 'XOF': 'CFA', 'XAF': 'FCFA', 'LRD': '$', 'SLL': 'Le', 'GNF': 'FG',
      'CDF': 'FC', 'RWF': 'RWF', 'BIF': 'FBu', 'TZS': 'TSh', 'ETB': 'Br', 'ERN': 'Nfk',
      'DJF': 'Fdj', 'SOS': 'S', 'BWP': 'P', 'LSL': 'L', 'SZL': 'L', 'NAD': '$',
      'ZWL': '$', 'ZMW': 'K', 'MWK': 'MK', 'MZN': 'MT', 'MGA': 'Ar', 'MUR': '₨', 'SCR': '₨'
    };
    
    return symbolMap[currencyCode] || currencyCode;
  }
}

export const countryDetectionService = new CountryDetectionService(); 