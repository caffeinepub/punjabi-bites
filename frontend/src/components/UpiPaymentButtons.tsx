import { GPayIcon, PhonePeIcon, PaytmIcon } from './icons/PaymentAppIcons';

type UpiApp = 'gpay' | 'phonepe' | 'paytm';

interface UpiPaymentButtonsProps {
  upiId: string;
  merchantName: string;
  amount: number;
  onAppTap?: (app: UpiApp) => void;
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

export default function UpiPaymentButtons({
  upiId,
  merchantName,
  amount,
  onAppTap,
}: UpiPaymentButtonsProps) {
  const handleClick = (app: UpiApp) => {
    onAppTap?.(app);
    const url = buildUpiDeepLink(app, upiId, merchantName, amount);
    openWithFallback(url, app);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={() => handleClick('gpay')}
        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
      >
        <GPayIcon size={40} />
        <span className="text-xs font-medium text-deepRed-700">GPay</span>
      </button>
      <button
        onClick={() => handleClick('phonepe')}
        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
      >
        <PhonePeIcon size={40} />
        <span className="text-xs font-medium text-deepRed-700">PhonePe</span>
      </button>
      <button
        onClick={() => handleClick('paytm')}
        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 hover:border-saffron-300 transition-all"
      >
        <PaytmIcon size={40} />
        <span className="text-xs font-medium text-deepRed-700">Paytm</span>
      </button>
    </div>
  );
}
