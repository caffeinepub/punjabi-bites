import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../contexts/CartContext';
import { useUPISettings } from '../hooks/useQueries';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  QrCode,
  Smartphone,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  scannedData: string | null;
}

const RECEIPT_STORAGE_KEY = 'punjabi_bites_receipt';

export function saveReceiptData(data: ReceiptData) {
  sessionStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(data));
}

export function loadReceiptData(): ReceiptData | null {
  try {
    const raw = sessionStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReceiptData;
  } catch {
    return null;
  }
}

export function clearReceiptData() {
  sessionStorage.removeItem(RECEIPT_STORAGE_KEY);
}

/** Detect if the user is on a mobile device */
export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/** Build a UPI deep link */
function buildUPIDeepLink(upiId: string, merchantName: string, amount: number): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: amount.toFixed(2),
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
}

/** UPI settings loading skeleton */
function UPILoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Skeleton className="w-48 h-48 rounded-2xl bg-saffron/10" />
      <Skeleton className="h-4 w-48 bg-saffron/10" />
      <Skeleton className="h-12 w-full rounded-xl bg-saffron/10" />
    </div>
  );
}

/** UPI settings error state */
function UPIErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 bg-red-50 rounded-2xl border border-red-100">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-red-700 mb-1">Failed to Load Payment Settings</p>
        <p className="text-sm text-red-500">
          We couldn't fetch the UPI payment settings. Please try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-5 py-3 bg-deepRed text-white rounded-xl font-semibold text-sm hover:bg-deepRed/90 disabled:opacity-60 transition-colors shadow-md min-h-[44px]"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying…' : 'Try Again'}
      </button>
    </div>
  );
}

/** Payment unavailable state — shown when UPI settings are not configured */
function PaymentUnavailableState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4 bg-saffron/5 rounded-2xl border-2 border-dashed border-saffron/30 text-center">
      <div className="w-16 h-16 rounded-full bg-saffron/10 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-saffron/60" />
      </div>
      <div>
        <p className="font-display font-bold text-deepRed text-lg mb-2">
          Payment Currently Unavailable
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Online payment is not configured yet. Please contact the restaurant to complete your order.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-deepRed text-white rounded-xl font-semibold text-sm hover:bg-deepRed/90 transition-colors shadow-md min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
      </div>
    </div>
  );
}

/** Desktop QR code display */
function DesktopQRDisplay({
  qrCodeData,
  merchantName,
  amount,
}: {
  qrCodeData: string;
  merchantName: string;
  amount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="bg-white rounded-2xl border-2 border-saffron/30 p-4 shadow-card">
        <img
          src={qrCodeData}
          alt="UPI Payment QR Code"
          className="w-56 h-56 object-contain"
        />
      </div>
      <div className="text-center space-y-1">
        <p className="font-display font-black text-deepRed text-lg">{merchantName}</p>
        <p className="text-gray-500 text-sm">Scan with any UPI app to pay</p>
        <p className="font-black text-spice text-2xl mt-2">₹{amount.toFixed(0)}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-saffron/10 rounded-xl px-4 py-2.5 border border-saffron/20 w-full justify-center">
        <QrCode className="w-4 h-4 text-saffron shrink-0" />
        <span>Open your UPI app and scan the QR code above</span>
      </div>
      {/* UPI app logos hint */}
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap justify-center">
        <span><span className="text-base">🟢</span> GPay</span>
        <span><span className="text-base">🟣</span> PhonePe</span>
        <span><span className="text-base">🔵</span> Paytm</span>
        <span><span className="text-base">🟠</span> BHIM</span>
      </div>
    </div>
  );
}

/** No QR code configured placeholder */
function NoQRCodePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 bg-saffron/5 rounded-2xl border-2 border-dashed border-saffron/30">
      <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center">
        <QrCode className="w-7 h-7 text-saffron/40" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-deepRed mb-1">QR Code Not Available</p>
        <p className="text-sm text-gray-500">
          The payment QR code has not been set up yet. Please pay at the counter.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const isMobile = isMobileDevice();

  const {
    data: upiSettings,
    isLoading: upiLoading,
    isFetching: upiFetching,
    error: upiError,
    refetch: refetchUPI,
  } = useUPISettings();

  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Redirect to menu if cart is empty and payment not yet confirmed
  useEffect(() => {
    if (cartItems.length === 0 && !paymentConfirmed) {
      navigate({ to: '/' });
    }
  }, [cartItems.length, paymentConfirmed, navigate]);

  const handlePayNow = () => {
    if (!upiSettings?.upiId) return;
    const deepLink = buildUPIDeepLink(
      upiSettings.upiId,
      upiSettings.merchantName,
      totalAmount
    );
    const receiptItems: ReceiptItem[] = cartItems.map((ci) => ({
      id: ci.item.id.toString(),
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
    }));
    saveReceiptData({ items: receiptItems, total: totalAmount, scannedData: null });
    window.location.href = deepLink;
    setPaymentInitiated(true);
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    clearCart();
    navigate({ to: '/receipt' });
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-10">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-deepRed font-semibold text-sm mb-5 hover:text-deepRed/70 transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-display font-black text-deepRed text-2xl sm:text-3xl">
            Complete Payment
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isMobile ? 'Pay securely via UPI' : 'Scan the QR code to pay via UPI'}
          </p>
        </div>

        {/* Order summary */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-saffron/20 shadow-card p-4 mb-5">
            <h2 className="font-display font-bold text-deepRed text-base mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-saffron" />
              Order Summary
            </h2>
            <div className="space-y-2">
              {cartItems.map((ci) => (
                <div key={ci.item.id.toString()} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {ci.item.name}
                    <span className="text-gray-400 ml-1">×{ci.quantity}</span>
                  </span>
                  <span className="font-semibold text-deepRed">
                    ₹{(ci.item.price * ci.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3 bg-saffron/15" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-deepRed">Total</span>
              <span className="font-black text-spice text-lg">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Payment section */}
        <div className="bg-white rounded-2xl border border-saffron/20 shadow-card p-5">
          <h2 className="font-display font-bold text-deepRed text-base mb-4">
            Payment Options
          </h2>

          {/* Loading state */}
          {upiLoading && <UPILoadingSkeleton />}

          {/* Error state */}
          {!upiLoading && upiError && (
            <UPIErrorState onRetry={refetchUPI} isRetrying={upiFetching} />
          )}

          {/* Payment unavailable — UPI not configured */}
          {!upiLoading && !upiError && !upiSettings?.upiId && (
            <PaymentUnavailableState onBack={handleBack} />
          )}

          {/* UPI settings available */}
          {!upiLoading && !upiError && upiSettings?.upiId && (
            <>
              {/* Mobile: UPI deep link flow */}
              {isMobile && (
                <div className="space-y-4">
                  {!paymentInitiated ? (
                    <>
                      <div className="flex flex-col items-center gap-3 py-4 bg-saffron/5 rounded-2xl border border-saffron/20">
                        <div className="w-14 h-14 rounded-full bg-deepRed/10 flex items-center justify-center">
                          <Smartphone className="w-7 h-7 text-deepRed" />
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-deepRed text-base">
                            {upiSettings.merchantName}
                          </p>
                          <p className="text-gray-500 text-sm">UPI ID: {upiSettings.upiId}</p>
                          <p className="font-black text-spice text-2xl mt-2">
                            ₹{totalAmount.toFixed(0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap justify-center">
                          <span><span className="text-base">🟢</span> GPay</span>
                          <span><span className="text-base">🟣</span> PhonePe</span>
                          <span><span className="text-base">🔵</span> Paytm</span>
                          <span><span className="text-base">🟠</span> BHIM</span>
                        </div>
                      </div>
                      <button
                        onClick={handlePayNow}
                        className="w-full flex items-center justify-center gap-2 bg-deepRed hover:bg-deepRed/90 text-white font-bold text-base py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[56px]"
                      >
                        <Smartphone className="w-5 h-5" />
                        Pay ₹{totalAmount.toFixed(0)} via UPI
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-saffron/10 border border-saffron/30 rounded-xl px-4 py-3">
                        <Smartphone className="w-5 h-5 text-saffron shrink-0 mt-0.5" />
                        <p className="text-sm text-deepRed font-medium">
                          Complete the payment in your UPI app, then tap the button below to confirm your order.
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmPayment}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[56px]"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        I've Paid — Confirm Order
                      </button>
                      <button
                        onClick={() => setPaymentInitiated(false)}
                        className="w-full text-sm text-gray-500 hover:text-deepRed underline py-2 transition-colors"
                      >
                        Go back and try again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop: QR code display */}
              {!isMobile && (
                <div className="space-y-4">
                  {upiSettings.qrCodeData ? (
                    <DesktopQRDisplay
                      qrCodeData={upiSettings.qrCodeData}
                      merchantName={upiSettings.merchantName}
                      amount={totalAmount}
                    />
                  ) : (
                    <NoQRCodePlaceholder />
                  )}
                  {/* After scanning, confirm button */}
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[56px]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    I've Paid — Confirm Order
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
