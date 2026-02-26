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

function buildUpiDeepLink(
  app: UpiApp,
  upiId: string,
  merchantName: string,
  amount: number
): string {
  const encodedUpiId = encodeURIComponent(upiId);
  const encodedName = encodeURIComponent(merchantName);
  const amountStr = amount.toFixed(2);
  const note = encodeURIComponent('Food Order - Punjabi Bites');

  // Use app-specific deep link schemes for both Android and iOS
  // These directly open the target app without triggering a generic UPI chooser
  const appSchemes: Record<UpiApp, string> = {
    gpay: `tez://upi/pay?pa=${encodedUpiId}&pn=${encodedName}&am=${amountStr}&cu=INR&tn=${note}`,
    phonepe: `phonepe://pay?pa=${encodedUpiId}&pn=${encodedName}&am=${amountStr}&cu=INR&tn=${note}`,
    paytm: `paytmmp://upi/pay?pa=${encodedUpiId}&pn=${encodedName}&am=${amountStr}&cu=INR&tn=${note}`,
  };

  return appSchemes[app];
}

function openWithFallback(url: string, app: UpiApp) {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    const storeUrls: Record<UpiApp, string> = {
      gpay: 'https://apps.apple.com/app/google-pay/id1193357041',
      phonepe: 'https://apps.apple.com/app/phonepe/id1170055821',
      paytm: 'https://apps.apple.com/app/paytm/id473941634',
    };
    window.location.href = url;
    setTimeout(() => {
      window.location.href = storeUrls[app];
    }, 2000);
    return;
  }

  // Android and desktop: use location.href so the custom scheme is handled by the OS
  window.location.href = url;
}

export default function UpiPaymentOptionsModal({
  isOpen,
  onClose,
  upiId,
  merchantName,
  amount,
  onPaymentConfirm,
}: UpiPaymentOptionsModalProps) {
  const handleAppPay = (app: UpiApp) => {
    const url = buildUpiDeepLink(app, upiId, merchantName, amount);
    openWithFallback(url, app);
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
