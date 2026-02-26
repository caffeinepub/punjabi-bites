import { GPayIcon, PhonePeIcon, PaytmIcon } from './icons/PaymentAppIcons';

type UpiApp = 'gpay' | 'phonepe' | 'paytm';

interface UpiPaymentButtonsProps {
  upiId: string;
  merchantName: string;
  amount: number;
  onAppTap?: (app: UpiApp) => void;
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

export default function UpiPaymentButtons({
  upiId,
  merchantName,
  amount,
  onAppTap,
}: UpiPaymentButtonsProps) {
  const handleClick = (app: UpiApp) => {
    onAppTap?.(app);
    const url = buildUpiLink(upiId, merchantName, amount);
    window.location.href = url;
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
