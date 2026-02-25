import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, ShoppingBag, Smartphone, CheckCircle2, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from '@tanstack/react-router';
import { useUPISettings } from '../hooks/useQueries';
import { saveReceiptData, ReceiptItem } from '../pages/PaymentPage';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Detect if the user is on a mobile device */
function isMobileDevice(): boolean {
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

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { cartItems, removeItem, updateQuantity, totalAmount, totalCount, clearCart } = useCart();
  const navigate = useNavigate();
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

  const handleCheckout = () => {
    onOpenChange(false);
    navigate({ to: '/payment' });
  };

  const handlePayNow = () => {
    if (!upiSettings?.upiId) return;
    const deepLink = buildUPIDeepLink(
      upiSettings.upiId,
      upiSettings.merchantName,
      totalAmount
    );
    // Save receipt data before leaving
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
    onOpenChange(false);
    navigate({ to: '/receipt' });
  };

  const cartIsEmpty = cartItems.length === 0;
  const hasUPI = !!upiSettings?.upiId;

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-deepRed text-cream rounded-full shadow-lg px-4 py-3 font-semibold text-sm hover:bg-deepRed/90 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden sm:inline">Cart</span>
        {totalCount > 0 && (
          <Badge className="bg-saffron text-deepRed font-bold text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full px-1.5 ml-0.5">
            {totalCount}
          </Badge>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-deepRed text-cream flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-saffron" />
            <h2 className="font-display font-black text-lg">Your Cart</h2>
            {totalCount > 0 && (
              <Badge className="bg-saffron text-deepRed font-bold text-xs px-2">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-saffron/10 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-saffron/40" />
            </div>
            <div>
              <p className="font-display font-bold text-deepRed text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-1">Add items from the menu to get started</p>
            </div>
            <Button
              variant="outline"
              className="border-saffron/40 text-deepRed hover:bg-saffron/10 mt-2"
              onClick={() => onOpenChange(false)}
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 py-3 min-h-0">
              <div className="space-y-3">
                {cartItems.map((ci) => (
                  <div
                    key={ci.item.id.toString()}
                    className="bg-cream/60 rounded-xl p-3 border border-saffron/15"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-deepRed text-sm leading-tight truncate">
                          {ci.item.name}
                        </p>
                        <p className="text-spice text-xs font-semibold mt-0.5">
                          ₹{ci.item.price.toFixed(0)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(ci.item.id)}
                        className="p-1 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                        aria-label={`Remove ${ci.item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-saffron/40 flex items-center justify-center hover:bg-saffron/10 text-deepRed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-deepRed text-sm w-5 text-center">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-saffron/40 flex items-center justify-center hover:bg-saffron/10 text-deepRed transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-bold text-spice text-sm">
                        ₹{(ci.item.price * ci.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer with total and actions */}
            <div className="px-5 py-4 border-t border-saffron/20 bg-white flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-sm">Subtotal</span>
                <span className="font-bold text-deepRed text-base">₹{totalAmount.toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Taxes and charges may apply</p>

              <Separator className="mb-3 bg-saffron/15" />

              <div className="space-y-2">
                {/* UPI loading indicator */}
                {upiLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading payment options…</span>
                  </div>
                )}

                {/* UPI error state */}
                {!upiLoading && upiError && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Failed to load payment settings</span>
                      </div>
                      <button
                        onClick={() => refetchUPI()}
                        disabled={upiFetching}
                        className="text-xs text-deepRed font-semibold underline shrink-0"
                      >
                        Retry
                      </button>
                    </div>
                    {/* Still show checkout as fallback */}
                    <Button
                      onClick={handleCheckout}
                      disabled={cartIsEmpty}
                      className="w-full bg-saffron hover:bg-saffron/90 text-deepRed font-bold text-base rounded-xl shadow-md gap-2 min-h-[52px]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Checkout · ₹{totalAmount.toFixed(0)}
                    </Button>
                  </div>
                )}

                {/* Payment options when UPI loaded successfully */}
                {!upiLoading && !upiError && (
                  <>
                    {/* Pay Now via UPI deep link — shown when UPI settings are available */}
                    {hasUPI && !paymentInitiated && (
                      <>
                        {isMobile ? (
                          <button
                            onClick={handlePayNow}
                            className="w-full flex items-center justify-center gap-2 bg-deepRed hover:bg-deepRed/90 text-white font-bold text-base py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[52px]"
                          >
                            <Smartphone className="w-5 h-5" />
                            Pay ₹{totalAmount.toFixed(0)} via UPI
                          </button>
                        ) : (
                          <button
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center gap-2 bg-deepRed hover:bg-deepRed/90 text-white font-bold text-base py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[52px]"
                          >
                            <CreditCard className="w-5 h-5" />
                            Pay ₹{totalAmount.toFixed(0)} Now
                          </button>
                        )}
                      </>
                    )}

                    {/* After payment initiated on mobile: confirm button */}
                    {isMobile && paymentInitiated && !paymentConfirmed && (
                      <>
                        <div className="flex items-start gap-2 bg-saffron/10 border border-saffron/30 rounded-xl px-3 py-2.5">
                          <Smartphone className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                          <p className="text-xs text-deepRed font-medium">
                            Complete the payment in your UPI app, then tap below.
                          </p>
                        </div>
                        <button
                          onClick={handleConfirmPayment}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 min-h-[52px]"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          I've Paid — Confirm Order
                        </button>
                      </>
                    )}

                    {/* No UPI configured: show checkout button that goes to payment page */}
                    {!hasUPI && (
                      <Button
                        onClick={handleCheckout}
                        disabled={cartIsEmpty}
                        className="w-full bg-saffron hover:bg-saffron/90 text-deepRed font-bold text-base rounded-xl shadow-md gap-2 min-h-[52px]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Checkout · ₹{totalAmount.toFixed(0)}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
