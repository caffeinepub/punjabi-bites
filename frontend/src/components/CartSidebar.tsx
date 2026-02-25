import { ShoppingCart, Plus, Minus, Trash2, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from '@tanstack/react-router';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { cartItems, removeItem, updateQuantity, totalAmount, totalCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate({ to: '/payment' });
  };

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
        <div className="flex items-center justify-between px-5 py-4 bg-deepRed text-cream">
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
            <ScrollArea className="flex-1 px-4 py-3">
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

            {/* Footer with total and checkout */}
            <div className="px-5 py-4 border-t border-saffron/20 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-sm">Subtotal</span>
                <span className="font-bold text-deepRed text-base">₹{totalAmount.toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Taxes and charges may apply</p>

              <Separator className="mb-4 bg-saffron/15" />

              <Button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-saffron hover:bg-saffron/90 text-deepRed font-bold text-base py-5 rounded-xl shadow-md gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Checkout · ₹{totalAmount.toFixed(0)}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
