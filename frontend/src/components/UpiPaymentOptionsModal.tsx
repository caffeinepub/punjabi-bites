import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { GPayIcon, PhonePeIcon, PaytmIcon } from './icons/PaymentAppIcons';

export type UpiApp = 'gpay' | 'phonepe' | 'paytm';

interface UpiPaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  merchantName: string;
  amount: number;
  onPaymentConfirm: (selectedApp: UpiApp | null) => void;
}

function buildUpiLink(upiId: string, merchantName: string, amount: number): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: 'Food Order - Punjabi Bites',
  });
  return `upi://pay?${params.toString()}`;
}

export default function UpiPaymentOptionsModal({
  isOpen,
  onClose,
  upiId,
  merchantName,
  amount,
  onPaymentConfirm,
}: UpiPaymentOptionsModalProps) {
  const handleAppPay = (_app: UpiApp) => {
    const url = buildUpiLink(upiId, merchantName, amount);
    window.location.href = url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-deepRed-800">Pay via UPI</DialogTitle>
          <DialogDescription className="text-spice-600">
            Total: <span className="font-bold text-saffron-600">₹{amount.toFixed(2)}</span>
            <br />
            Choose your preferred payment app
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-2">
          <button
            onClick={() => handleAppPay('gpay')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
          >
            <GPayIcon size={40} />
            <span className="text-xs font-medium text-deepRed-700">GPay</span>
          </button>
          <button
            onClick={() => handleAppPay('phonepe')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
          >
            <PhonePeIcon size={40} />
            <span className="text-xs font-medium text-deepRed-700">PhonePe</span>
          </button>
          <button
            onClick={() => handleAppPay('paytm')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
          >
            <PaytmIcon size={40} />
            <span className="text-xs font-medium text-deepRed-700">Paytm</span>
          </button>
        </div>

        <div className="pt-2 border-t border-cream-200">
          <p className="text-xs text-spice-500 text-center mb-3">
            After completing payment, tap confirm below
          </p>
          <Button
            onClick={() => onPaymentConfirm(null)}
            className="w-full bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-bold"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Done – Confirm Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
