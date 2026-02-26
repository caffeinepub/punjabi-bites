import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../contexts/CartContext';
import { useGetUpiSettings } from '../hooks/useQueries';
import { ShoppingCart, X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import UpiPaymentOptionsModal, { UpiApp } from './UpiPaymentOptionsModal';

export default function CartSidebar() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalAmount, totalCount, clearCart } = useCart();
  const { data: upiSettings } = useGetUpiSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleCheckout = () => {
    if (isMobile) {
      setShowPaymentModal(true);
    } else {
      navigate({ to: '/payment' });
    }
  };

  const handlePaymentConfirm = (_selectedApp: UpiApp | null) => {
    setShowPaymentModal(false);
    clearCart();
    navigate({ to: '/' });
  };

  if (items.length === 0 && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 rounded-full p-4 shadow-lg transition-all z-40"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {/* Cart toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 rounded-full p-4 shadow-lg transition-all z-40"
        aria-label="Toggle cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-deepRed-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
            {totalCount}
          </Badge>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-deepRed-600 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-display font-bold text-lg">Your Cart</h2>
            {totalCount > 0 && (
              <Badge className="bg-saffron-400 text-deepRed-900 text-xs">
                {totalCount} items
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-deepRed-700 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-cream-300 mx-auto mb-3" />
              <p className="text-spice-500 font-medium">Your cart is empty</p>
              <p className="text-spice-400 text-sm mt-1">Add items from the menu</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id.toString()}
                className="flex items-center gap-3 bg-cream-50 rounded-lg p-3"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-deepRed-800 text-sm truncate">{item.name}</p>
                  <p className="text-saffron-600 font-bold text-sm">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-saffron-300 text-saffron-600 hover:bg-saffron-50 transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                  </button>
                  <span className="w-6 text-center font-bold text-deepRed-700 text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-saffron-300 text-saffron-600 hover:bg-saffron-50 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-cream-200 bg-cream-50">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-deepRed-800 text-lg">Total</span>
              <span className="font-bold text-saffron-600 text-xl">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-bold text-base py-3"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Pay Now
            </Button>
          </div>
        )}
      </div>

      {/* UPI Payment Options Modal (mobile) */}
      {upiSettings && (
        <UpiPaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          upiId={upiSettings.upiId}
          merchantName={upiSettings.merchantName}
          amount={totalAmount}
          onPaymentConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
}
