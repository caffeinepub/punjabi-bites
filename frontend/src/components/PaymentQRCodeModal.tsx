import { useGetPaymentQRCode } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { QrCode, X, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { CartItem } from '../contexts/CartContext';

interface OrderSummary {
  items: CartItem[];
  total: number;
}

interface PaymentQRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderSummary?: OrderSummary;
}

export default function PaymentQRCodeModal({ open, onOpenChange, orderSummary }: PaymentQRCodeModalProps) {
  const { data: qrCode, isLoading, isFetching, error, refetch } = useGetPaymentQRCode();

  const hasOrder = orderSummary && orderSummary.items.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-black text-deepRed flex items-center gap-2">
            <QrCode className="w-5 h-5 text-saffron" />
            {hasOrder ? 'Checkout & Pay' : 'Pay via QR Code'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {hasOrder
              ? 'Review your order and scan the QR code to complete payment.'
              : 'Scan the QR code below with your payment app to complete your payment.'}
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        {hasOrder && (
          <div className="bg-cream/60 rounded-xl border border-saffron/20 p-4 mb-1">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-saffron" />
              <h3 className="font-display font-bold text-deepRed text-sm">Order Summary</h3>
            </div>
            <div className="space-y-2">
              {orderSummary.items.map((ci) => (
                <div key={ci.item.id.toString()} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-gray-500 font-medium flex-shrink-0">×{ci.quantity}</span>
                    <span className="text-deepRed font-medium truncate">{ci.item.name}</span>
                  </div>
                  <span className="text-spice font-bold flex-shrink-0 ml-2">
                    ₹{(ci.item.price * ci.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3 bg-saffron/20" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-deepRed text-sm">Total Amount</span>
              <span className="font-black text-spice text-lg">₹{orderSummary.total.toFixed(0)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center py-2 gap-4">
          {isLoading ? (
            <Skeleton className="w-52 h-52 rounded-xl bg-saffron/10" />
          ) : error ? (
            /* Error state with retry */
            <div className="w-52 h-52 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center gap-3 px-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-600 text-center font-medium">
                Failed to load payment QR
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
                className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Retrying…' : 'Try Again'}
              </Button>
            </div>
          ) : qrCode ? (
            <div className="p-3 bg-white rounded-2xl border-2 border-saffron/30 shadow-md">
              <img
                src={qrCode}
                alt="Payment QR Code"
                className="w-52 h-52 object-contain"
              />
            </div>
          ) : (
            <div className="w-52 h-52 rounded-2xl border-2 border-dashed border-saffron/30 bg-saffron/5 flex flex-col items-center justify-center gap-3">
              <QrCode className="w-12 h-12 text-saffron/40" />
              <p className="text-sm text-gray-400 text-center px-4 font-medium">
                Payment QR not available yet
              </p>
              <p className="text-xs text-gray-400 text-center px-4">
                Please ask the staff for payment details.
              </p>
            </div>
          )}

          {qrCode && !error && (
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Open your UPI / payment app, tap <strong>Scan QR</strong>, and point your camera at the code above.
              {hasOrder && (
                <span className="block mt-1 font-semibold text-spice">
                  Enter ₹{orderSummary.total.toFixed(0)} as the payment amount.
                </span>
              )}
            </p>
          )}
        </div>

        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full border-saffron/30 text-deepRed hover:bg-saffron/10 gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
