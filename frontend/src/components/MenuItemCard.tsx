import { MenuItem, Category } from '../backend';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItemCardProps {
  item: MenuItem;
}

const categoryLabels: Record<string, string> = {
  [Category.appetizer]: 'Appetizer',
  [Category.mainCourse]: 'Main Course',
  [Category.dessert]: 'Dessert',
  [Category.beverage]: 'Beverage',
};

const categoryColors: Record<string, string> = {
  [Category.appetizer]: 'bg-spice-100 text-spice-700 border-spice-200',
  [Category.mainCourse]: 'bg-saffron-100 text-saffron-700 border-saffron-200',
  [Category.dessert]: 'bg-pink-100 text-pink-700 border-pink-200',
  [Category.beverage]: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem, removeItem, updateQuantity, items } = useCart();

  const cartItem = items.find((ci) => ci.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    if (quantity === 0) {
      addItem(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity === 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 bg-cream-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-100">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-deepRed-800 text-lg leading-tight">
            {item.name}
          </h3>
          <span className="text-saffron-600 font-bold text-lg whitespace-nowrap">
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-spice-600 text-sm mb-3 flex-1 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${categoryColors[item.category] ?? ''}`}
          >
            {categoryLabels[item.category] ?? item.category}
          </Badge>

          {item.isAvailable && (
            <>
              {quantity === 0 ? (
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold gap-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleRemove}
                    className="h-8 w-8 border-saffron-300 text-saffron-600 hover:bg-saffron-50"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-bold text-deepRed-700 w-5 text-center">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleAdd}
                    className="h-8 w-8 border-saffron-300 text-saffron-600 hover:bg-saffron-50"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
