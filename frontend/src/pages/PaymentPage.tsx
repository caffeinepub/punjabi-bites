import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../contexts/CartContext';
import { useGetPaymentQRCode } from '../hooks/useQueries';
import { useQRScanner } from '../qr-code/useQRScanner';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  QrCode,
  ShoppingCart,
  Camera,
  CameraOff,
  ArrowLeft,
  ScanLine,
  AlertCircle,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Wallet,
  RefreshCw,
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

function saveReceiptData(data: ReceiptData) {
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

interface PaymentAppOption {
  name: string;
  icon: string;
  url: string;
  color: string;
}

/**
 * Given a scanned QR string, return a list of payment app options.
 * For UPI URIs, we generate deep links for each major UPI app.
 * For plain URLs, we return a single option.
 */
function getPaymentAppOptions(scannedData: string): PaymentAppOption[] {
  const lower = scannedData.toLowerCase();

  // UPI URI — generate per-app deep links
  if (lower.startsWith('upi://')) {
    const upiParams = scannedData.slice('upi://pay?'.length);
    return [
      {
        name: 'Google Pay',
        icon: '🟢',
        url: `gpay://upi/pay?${upiParams}`,
        color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800',
      },
      {
        name: 'PhonePe',
        icon: '🟣',
        url: `phonepe://pay?${upiParams}`,
        color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800',
      },
      {
        name: 'Paytm',
        icon: '🔵',
        url: `paytmmp://pay?${upiParams}`,
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800',
      },
      {
        name: 'BHIM',
        icon: '🟠',
        url: `bhim://pay?${upiParams}`,
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-800',
      },
      {
        name: 'Any UPI App',
        icon: '📱',
        url: scannedData,
        color: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800',
      },
    ];
  }

  // GPay specific
  if (lower.includes('gpay') || lower.includes('googlepay')) {
    return [{ name: 'Google Pay', icon: '🟢', url: scannedData, color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800' }];
  }

  // PhonePe specific
  if (lower.includes('phonepe')) {
    return [{ name: 'PhonePe', icon: '🟣', url: scannedData, color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800' }];
  }

  // Paytm specific
  if (lower.includes('paytm')) {
    return [{ name: 'Paytm', icon: '🔵', url: scannedData, color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800' }];
  }

  // PayPal
  if (lower.includes('paypal')) {
    return [{ name: 'PayPal', icon: '💙', url: scannedData, color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800' }];
  }

  // Generic HTTP URL
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return [{ name: 'Open Payment Link', icon: '🌐', url: scannedData, color: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900' }];
  }

  // Fallback — treat as UPI-like, show all apps
  return [
    {
      name: 'Google Pay',
      icon: '🟢',
      url: `gpay://upi/pay?${scannedData}`,
      color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800',
    },
    {
      name: 'PhonePe',
      icon: '🟣',
      url: `phonepe://pay?${scannedData}`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800',
    },
    {
      name: 'Paytm',
      icon: '🔵',
      url: `paytmmp://pay?${scannedData}`,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800',
    },
    {
      name: 'Any UPI App',
      icon: '📱',
      url: scannedData,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800',
    },
  ];
}

/**
 * Open a payment URL reliably.
 * - For deep links (non-http), use window.location.href so the OS can intercept them.
 * - For http/https URLs, use window.open with _blank.
 */
function openPaymentUrl(url: string) {
  const lower = url.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = url;
    }
  } else {
    window.location.href = url;
  }
}

/** Returns true if the stored QR code value is a payment URL (not a base64 image) */
function isPaymentUrl(value: string): boolean {
  return (
    value.startsWith('upi://') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('gpay://') ||
    value.startsWith('phonepe://') ||
    value.toLowerCase().startsWith('paytm')
  );
}

/** QR code loading skeleton */
function QRLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <Skeleton className="w-56 h-56 rounded-2xl bg-saffron/10" />
      <Skeleton className="h-4 w-48 bg-saffron/10" />
      <Skeleton className="h-10 w-40 rounded-lg bg-saffron/10" />
    </div>
  );
}

/** QR code error state */
function QRErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 bg-red-50 rounded-2xl border border-red-100">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-red-700 mb-1">Failed to Load Payment Options</p>
        <p className="text-sm text-red-500">
          We couldn't fetch the payment QR code. Please try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-5 py-2.5 bg-deepRed text-white rounded-lg font-semibold text-sm hover:bg-deepRed/90 disabled:opacity-60 transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying…' : 'Try Again'}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useCart();
  const { data: qrCode, isLoading: qrLoading, isFetching: qrFetching, error: qrError, refetch: refetchQR } = useGetPaymentQRCode();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const navigatedRef = useRef(false);

  // Payment app selection dialog state
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentAppOptions, setPaymentAppOptions] = useState<PaymentAppOption[]>([]);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 150,
    maxResults: 1,
  });

  // Navigate to receipt after payment confirmation
  useEffect(() => {
    if (paymentConfirmed && !navigatedRef.current) {
      navigatedRef.current = true;
      const receiptItems: ReceiptItem[] = cartItems.map((ci) => ({
        id: ci.item.id.toString(),
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      }));
      saveReceiptData({
        items: receiptItems,
        total: totalAmount,
        scannedData: qrResults[0]?.data ?? null,
      });
      navigate({ to: '/receipt' });
    }
  }, [paymentConfirmed, cartItems, totalAmount, qrResults, navigate]);

  // Handle scanned QR result — open payment app dialog
  useEffect(() => {
    if (qrResults.length > 0 && isScanning) {
      const scanned = qrResults[0].data;
      stopScanning();
      const options = getPaymentAppOptions(scanned);
      setPaymentAppOptions(options);
      setPendingPaymentUrl(scanned);
      setDialogOpen(true);
    }
  }, [qrResults, isScanning, stopScanning]);

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
  };

  const handlePayWithApp = (option: PaymentAppOption) => {
    setRedirectError(null);
    try {
      openPaymentUrl(option.url);
    } catch {
      setRedirectError(`Could not open ${option.name}. Please try another app.`);
    }
  };

  const handleDialogConfirmPaid = () => {
    setDialogOpen(false);
    setPaymentConfirmed(true);
  };

  // Determine what kind of QR code we have
  const qrIsUrl = qrCode ? isPaymentUrl(qrCode) : false;
  const qrIsImage = qrCode ? !isPaymentUrl(qrCode) : false;

  return (
    <div className="min-h-screen bg-cream/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-deepRed/70 hover:text-deepRed font-medium text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-black text-deepRed mb-2">
            Complete Your Order
          </h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-saffron/50" />
            <span className="text-saffron">✦</span>
            <div className="h-px w-12 bg-saffron/50" />
          </div>
          <p className="text-gray-500 text-sm">Review your order and pay to confirm</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-saffron/20 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-saffron" />
            <h2 className="font-display font-black text-deepRed text-lg">Order Summary</h2>
          </div>

          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cartItems.map((ci) => (
                  <div key={ci.item.id.toString()} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {ci.item.imageUrl && (
                        <img
                          src={ci.item.imageUrl}
                          alt={ci.item.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-deepRed text-sm truncate">{ci.item.name}</p>
                        <p className="text-gray-400 text-xs">₹{ci.item.price.toFixed(0)} × {ci.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-spice text-sm flex-shrink-0 ml-3">
                      ₹{(ci.item.price * ci.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="bg-saffron/20 mb-4" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-deepRed">Total</span>
                <span className="font-black text-spice text-xl">₹{totalAmount.toFixed(0)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── Pay Now Section ── */}
        <div className="bg-white rounded-2xl border border-saffron/20 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-saffron" />
            <h2 className="font-display font-black text-deepRed text-lg">Pay Now</h2>
          </div>

          {/* Loading state */}
          {qrLoading && <QRLoadingSkeleton />}

          {/* Error state */}
          {!qrLoading && qrError && (
            <QRErrorState onRetry={refetchQR} isRetrying={qrFetching} />
          )}

          {/* QR code is a payment URL — show UPI app buttons */}
          {!qrLoading && !qrError && qrIsUrl && qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-saffron" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-deepRed mb-1">Pay with UPI App</p>
                <p className="text-sm text-gray-500">
                  Tap your preferred payment app below to pay ₹{totalAmount.toFixed(0)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {getPaymentAppOptions(qrCode).map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => handlePayWithApp(opt)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-colors ${opt.color}`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    {opt.name}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                  </button>
                ))}
              </div>
              <Separator className="bg-saffron/20 w-full" />
              <button
                onClick={handleConfirmPayment}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-deepRed text-white rounded-xl font-bold text-base hover:bg-deepRed/90 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                I've Paid — Confirm Order
              </button>
            </div>
          )}

          {/* QR code is a base64 image — show scannable QR */}
          {!qrLoading && !qrError && qrIsImage && qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-white rounded-2xl border-2 border-saffron/30 shadow-md">
                <img
                  src={qrCode}
                  alt="Payment QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Open your UPI / payment app, tap <strong>Scan QR</strong>, and point your camera at the code above.
                <span className="block mt-1 font-semibold text-spice">
                  Enter ₹{totalAmount.toFixed(0)} as the payment amount.
                </span>
              </p>
              <button
                onClick={handleConfirmPayment}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-deepRed text-white rounded-xl font-bold text-base hover:bg-deepRed/90 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                I've Paid — Confirm Order
              </button>
            </div>
          )}

          {/* No QR code set — manual fallback */}
          {!qrLoading && !qrError && !qrCode && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center">
                <QrCode className="w-7 h-7 text-saffron/50" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-deepRed mb-1">Pay at Counter</p>
                <p className="text-sm text-gray-500">
                  No digital payment is set up yet. Please pay at the counter and confirm below.
                </p>
              </div>
              <button
                onClick={handleConfirmPayment}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-deepRed text-white rounded-xl font-bold text-base hover:bg-deepRed/90 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                I've Paid — Confirm Order
              </button>
            </div>
          )}
        </div>

        {/* ── Optional: Camera QR Scanner Section ── */}
        <div className="bg-white rounded-2xl border border-saffron/20 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-saffron" />
              <h2 className="font-display font-black text-deepRed text-lg">Scan a QR Code</h2>
            </div>
            <Badge variant="outline" className="text-xs border-saffron/30 text-gray-500">
              Optional
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Use your camera to scan a payment QR code shown by the staff.
          </p>

          {isSupported === false ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-4">
              <CameraOff className="w-4 h-4" />
              Camera not supported on this device.
            </div>
          ) : (
            <>
              {/* Camera preview */}
              {isActive && (
                <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-saffron rounded-xl opacity-70" />
                    </div>
                  )}
                </div>
              )}
              {!isActive && <canvas ref={canvasRef} className="hidden" />}

              {cameraError && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-3 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {cameraError.message}
                </div>
              )}

              <div className="flex gap-3">
                {!isActive ? (
                  <button
                    onClick={startScanning}
                    disabled={!canStartScanning || cameraLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-saffron text-white rounded-xl font-semibold text-sm hover:bg-saffron/90 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    {cameraLoading ? 'Starting…' : 'Start Scanner'}
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    disabled={cameraLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    <CameraOff className="w-4 h-4" />
                    Stop Scanner
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment App Selection Dialog (after scanning) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-black text-deepRed flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-saffron" />
              Choose Payment App
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              QR code scanned! Select your preferred payment app to complete the payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            {paymentAppOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => handlePayWithApp(opt)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm transition-colors ${opt.color}`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="flex-1 text-left">{opt.name}</span>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </button>
            ))}
          </div>

          {redirectError && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {redirectError}
            </div>
          )}

          <Separator className="bg-saffron/20" />

          <button
            onClick={handleDialogConfirmPaid}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-deepRed text-white rounded-xl font-bold text-sm hover:bg-deepRed/90 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            I've Paid — Confirm Order
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
