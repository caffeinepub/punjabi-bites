import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../contexts/CartContext';
import { loadReceiptData, clearReceiptData, ReceiptData } from './PaymentPage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, Printer, UtensilsCrossed } from 'lucide-react';

export default function OrderReceiptPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Load receipt data from sessionStorage (set by PaymentPage before navigating)
  const [receiptData] = useState<ReceiptData | null>(() => loadReceiptData());

  // Clear cart and sessionStorage when receipt is shown
  useEffect(() => {
    clearCart();
    clearReceiptData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If no receipt data, redirect home
  useEffect(() => {
    if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
      navigate({ to: '/' });
    }
  }, [receiptData, navigate]);

  if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
    return null;
  }

  const { items, total } = receiptData;
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-black text-deepRed mb-1">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-sm">
          Thank you for dining with us. Your order has been received.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-white rounded-2xl border border-saffron/20 shadow-md overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-deepRed px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <UtensilsCrossed className="w-5 h-5 text-saffron" />
            <span className="font-display font-black text-saffron text-xl tracking-wide">
              PUNJABI BITES
            </span>
          </div>
          <p className="text-cream/70 text-xs tracking-widest uppercase">
            Authentic Flavors
          </p>
        </div>

        {/* Order Meta */}
        <div className="px-6 py-4 bg-cream/40 border-b border-saffron/15">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Order #</span>
            <span className="font-bold text-deepRed">{orderNumber}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Date</span>
            <span className="font-medium text-deepRed">{dateStr}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Time</span>
            <span className="font-medium text-deepRed">{timeStr}</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Items Ordered
          </p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 text-sm font-medium flex-shrink-0 w-6 text-center mt-0.5">
                    ×{item.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-deepRed font-semibold text-sm leading-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      ₹{item.price.toFixed(0)} each
                    </p>
                  </div>
                </div>
                <span className="text-spice font-bold text-sm flex-shrink-0">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4 bg-saffron/20" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-deepRed">₹{total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes & Charges</span>
              <span className="font-semibold text-deepRed">Included</span>
            </div>
            <Separator className="bg-saffron/15" />
            <div className="flex justify-between items-center">
              <span className="font-black text-deepRed text-base">Total Paid</span>
              <span className="font-black text-spice text-2xl">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="px-6 py-4 bg-cream/40 border-t border-saffron/15 text-center">
          <p className="text-xs text-gray-500 font-medium">
            🙏 Thank you for your visit!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            We hope to see you again soon.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="flex-1 border-saffron/30 text-deepRed hover:bg-saffron/10 gap-2 font-semibold py-5 rounded-xl"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
        <Button
          onClick={() => navigate({ to: '/' })}
          className="flex-1 bg-deepRed hover:bg-deepRed/90 text-cream font-bold gap-2 py-5 rounded-xl"
        >
          <Home className="w-4 h-4" />
          Back to Menu
        </Button>
      </div>
    </div>
  );
}
