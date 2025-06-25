
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from 'lucide-react';

interface AcceptRequestButtonBlockProps {
  tripId: string;
  onAccept: (tripId: string) => Promise<void>;
}

const AcceptRequestButtonBlock: React.FC<AcceptRequestButtonBlockProps> = ({
  tripId,
  onAccept
}) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(tripId);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Button
      onClick={handleAccept}
      disabled={isAccepting}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
      size="lg"
    >
      {isAccepting ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Accepting...
        </>
      ) : (
        <>
          <Check className="w-5 h-5 mr-2" />
          ✅ Accept Request
        </>
      )}
    </Button>
  );
};

export default AcceptRequestButtonBlock;
