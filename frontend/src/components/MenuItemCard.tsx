import { MenuItem, Category } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
}

function categoryEmoji(category: Category): string {
  switch (category) {
    case Category.appetizer: return '🥗';
    case Category.mainCourse: return '🍛';
    case Category.dessert: return '🍮';
    case Category.beverage: return '🥤';
    default: return '🍽️';
  }
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem, cartItems } = useCart();

  const cartEntry = cartItems.find((ci) => ci.item.id === item.id);
  const inCart = !!cartEntry;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-md overflow-hidden border transition-all duration-200 hover:shadow-lg ${
        item.isAvailable
          ? 'border-saffron/20 hover:border-saffron/40'
          : 'border-gray-200 opacity-60 grayscale-[40%]'
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${item.isAvailable ? 'bg-gradient-to-r from-saffron to-spice' : 'bg-gray-300'}`} />

      <div className="p-4 md:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="text-xl mt-0.5 flex-shrink-0">{categoryEmoji(item.category)}</span>
            <h3 className={`font-display font-bold text-base md:text-lg leading-tight ${
              item.isAvailable ? 'text-deepRed' : 'text-gray-500'
            }`}>
              {item.name}
            </h3>
          </div>
          <span className={`font-bold text-base md:text-lg flex-shrink-0 ${
            item.isAvailable ? 'text-spice' : 'text-gray-400'
          }`}>
            ₹{item.price.toFixed(0)}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className={`text-sm leading-relaxed mb-3 ml-7 ${
            item.isAvailable ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {item.description}
          </p>
        )}

        {/* Availability badge + Add to Cart */}
        <div className="ml-7 flex items-center justify-between gap-2 flex-wrap">
          {item.isAvailable ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs font-semibold px-2 py-0.5">
              <CheckCircle className="w-3 h-3" />
              Available
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-50 text-red-500 border-red-200 gap-1 text-xs font-semibold px-2 py-0.5">
              <XCircle className="w-3 h-3" />
              Sold Out
            </Badge>
          )}

          {item.isAvailable && (
            <Button
              size="sm"
              onClick={() => addItem(item)}
              className={`h-7 text-xs font-bold gap-1 rounded-full transition-all duration-200 ${
                inCart
                  ? 'bg-saffron/20 text-deepRed border border-saffron/50 hover:bg-saffron/30'
                  : 'bg-saffron hover:bg-saffron/90 text-deepRed shadow-sm'
              }`}
            >
              {inCart ? (
                <>
                  <Plus className="w-3 h-3" />
                  Add More ({cartEntry!.quantity})
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
