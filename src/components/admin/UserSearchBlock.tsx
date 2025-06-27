
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from 'lucide-react';

const UserSearchBlock: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            Search results will appear here...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSearchBlock;
