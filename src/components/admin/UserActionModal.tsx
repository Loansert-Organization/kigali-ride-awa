
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfileTab } from './UserProfileTab';
import { UserTripsTab } from './UserTripsTab';
import { UserReferralsTab } from './UserReferralsTab';
import { UserLogsTab } from './UserLogsTab';
import { MessageCircle, Download, Trash2, RotateCcw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger' | 'admin';
  tripsCount: number;
  lastSeen: string;
  status: 'active' | 'banned' | 'flagged';
  dateJoined: string;
}

interface UserActionModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({
  user,
  isOpen,
  onClose,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleWhatsAppMessage = () => {
    const message = `Hello! This is a message from Kigali Ride support team.`;
    const whatsappUrl = `https://wa.me/${user.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportData = () => {
    // TODO: Implement user data export
    console.log('Exporting user data for:', user.id);
  };

  const handleClearMemory = () => {
    // TODO: Implement AI agent memory clearing
    console.log('Clearing AI memory for:', user.id);
  };

  const handleResetLogin = () => {
    // TODO: Implement login reset
    console.log('Resetting login for:', user.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>👤 User Details: {user.name || 'Anonymous User'}</span>
            <Badge variant={user.role === 'driver' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppMessage}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMemory}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear AI Memory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLogin}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Login
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <UserProfileTab user={user} onRefresh={onRefresh} />
            </TabsContent>

            <TabsContent value="trips" className="mt-6">
              <UserTripsTab userId={user.id} />
            </TabsContent>

            <TabsContent value="referrals" className="mt-6">
              <UserReferralsTab userId={user.id} />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <UserLogsTab userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
