
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => Promise<boolean>;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);
    
    try {
      const success = await onApply(code.trim().toUpperCase());
      
      if (success) {
        toast({
          title: "Code Applied!",
          description: "Your promo code has been successfully applied"
        });
        setCode('');
        onClose();
      } else {
        toast({
          title: "Invalid Code",
          description: "This promo code is not valid or has expired",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            Enter Promo Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your promo code"
              className="uppercase"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the code exactly as received
            </p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
              disabled={isApplying || !code.trim()}
            >
              {isApplying ? 'Applying...' : 'Apply Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeModal;
