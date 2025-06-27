
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Car, Bot, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { devLog } from '@/utils/errorHandlers';

interface SearchResult {
  type: 'user' | 'trip' | 'log';
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  metadata?: {
    role?: string;
    trips?: number;
    fare?: number;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export const GlobalAdminSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Mock search function - in real implementation, this would call Supabase
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock results
    const mockResults: SearchResult[] = [
      {
        type: 'user',
        id: 'user-1',
        title: 'John Doe',
        subtitle: '+250788123456',
        status: 'active',
        metadata: { role: 'driver', trips: 15 }
      },
      {
        type: 'trip',
        id: 'trip-1',
        title: 'Kigali → Huye',
        subtitle: 'Today at 3:00 PM',
        status: 'completed',
        metadata: { fare: 3500, role: 'driver' }
      },
      {
        type: 'log',
        id: 'log-1',
        title: 'RideMatchAgent',
        subtitle: 'Matched passenger with driver',
        status: 'success',
        metadata: { timestamp: new Date().toISOString() }
      }
    ];

    // Filter results based on query
    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
    setIsSearching(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'trip': return <Car className="w-4 h-4" />;
      case 'log': return <Bot className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'failure':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewResult = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        navigate(`/admin/user-details?id=${result.id}`);
        break;
      case 'trip':
        navigate(`/admin/trip-details?id=${result.id}`);
        break;
      case 'log':
        devLog('View log details:', result);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by phone number, trip ID, promo code, or user name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((result) => (
                <div key={`${result.type}-${result.id}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          {result.status && (
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                        
                        {/* Additional metadata */}
                        {result.metadata && (
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {result.type === 'user' && (
                              <>
                                <span>Role: {result.metadata.role}</span>
                                <span>Trips: {result.metadata.trips}</span>
                              </>
                            )}
                            {result.type === 'trip' && (
                              <>
                                <span>Fare: RWF {result.metadata.fare?.toLocaleString()}</span>
                                <span>Created by: {result.metadata.role}</span>
                              </>
                            )}
                            {result.type === 'log' && (
                              <span>
                                {new Date(result.metadata.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResult(result)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {query && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No results found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-1">
              Try searching by phone number, trip ID, promo code, or user name
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
