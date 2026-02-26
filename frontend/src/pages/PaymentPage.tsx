import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../contexts/CartContext';
import { useGetUpiSettings } from '../hooks/useQueries';
import UpiPaymentButtons from '../components/UpiPaymentButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Loader2, QrCode, AlertCircle } from 'lucide-react';

type UpiApp = 'gpay' | 'phonepe' | 'paytm';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { data: upiSettings, isLoading, isError, refetch } = useGetUpiSettings();
  const [lastTappedApp, setLastTappedApp] = useState<UpiApp | null>(null);

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const handlePaymentConfirm = () => {
    clearCart();
    navigate({ to: '/' });
  };

  const handleAppTap = (app: UpiApp) => {
    setLastTappedApp(app);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-spice-600 text-lg mb-4">Your cart is empty.</p>
        <Button
          onClick={() => navigate({ to: '/' })}
          className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-spice-600 hover:text-deepRed-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Menu
      </button>

      <h1 className="font-display text-3xl font-bold text-deepRed-800 mb-8">Complete Payment</h1>

      {/* Order Summary */}
      <Card className="mb-6 border-cream-200">
        <CardHeader className="bg-cream-50 rounded-t-lg">
          <CardTitle className="text-deepRed-800 font-display">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id.toString()} className="flex justify-between items-center">
                <div>
                  <span className="text-deepRed-700 font-medium">{item.name}</span>
                  <span className="text-spice-500 text-sm ml-2">× {item.quantity}</span>
                </div>
                <span className="text-saffron-600 font-semibold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-deepRed-800 text-lg">Total</span>
            <span className="font-bold text-saffron-600 text-xl">₹{totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
        </div>
      ) : isError ? (
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-3">Failed to load payment settings</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !upiSettings ? (
        <Card className="border-cream-200">
          <CardContent className="pt-6 text-center">
            <QrCode className="h-10 w-10 text-spice-400 mx-auto mb-3" />
            <p className="text-spice-600 font-medium">Payment not configured</p>
            <p className="text-spice-400 text-sm mt-1">
              Please contact the restaurant to set up payment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-saffron-200">
          <CardHeader className="bg-saffron-50 rounded-t-lg">
            <CardTitle className="text-deepRed-800 font-display flex items-center gap-2">
              <QrCode className="h-5 w-5 text-saffron-600" />
              Pay via UPI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* QR Code */}
            {upiSettings.qrCodeData && (
              <div className="flex flex-col items-center">
                <p className="text-spice-600 text-sm mb-3 text-center">
                  Scan this QR code with any UPI app
                </p>
                <div className="border-2 border-saffron-200 rounded-xl p-4 bg-white shadow-sm">
                  <img
                    src={upiSettings.qrCodeData}
                    alt="Payment QR Code"
                    className="h-48 w-48 object-contain"
                  />
                </div>
                <p className="text-xs text-spice-400 mt-2">
                  UPI ID: {upiSettings.upiId}
                </p>
              </div>
            )}

            {/* UPI App Buttons */}
            <div>
              <p className="text-spice-600 text-sm mb-3 text-center font-medium">
                {upiSettings.qrCodeData ? 'Or pay via app' : 'Pay via UPI app'}
              </p>
              <UpiPaymentButtons
                upiId={upiSettings.upiId}
                merchantName={upiSettings.merchantName}
                amount={totalAmount}
                onAppTap={handleAppTap}
              />
            </div>

            <Separator />

            {/* Confirm Button */}
            <div className="text-center">
              <p className="text-spice-500 text-sm mb-3">
                After completing payment, tap the button below to confirm your order
              </p>
              <Button
                onClick={handlePaymentConfirm}
                className="w-full bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-bold text-base py-3"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Payment Done – Confirm Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
