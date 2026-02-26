import { useState } from 'react';
import { useGetMenuItems } from '../hooks/useQueries';
import { Category, MenuItem } from '../backend';
import MenuItemCard from '../components/MenuItemCard';
import CartSidebar from '../components/CartSidebar';
import { Loader2, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryOrder: Category[] = [
  Category.appetizer,
  Category.mainCourse,
  Category.dessert,
  Category.beverage,
];

const categoryLabels: Record<string, string> = {
  [Category.appetizer]: '🥗 Appetizers',
  [Category.mainCourse]: '🍛 Main Course',
  [Category.dessert]: '🍮 Desserts',
  [Category.beverage]: '🥤 Beverages',
};

function MenuErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <UtensilsCrossed className="h-16 w-16 text-spice-300 mb-4" />
      <h2 className="font-display text-2xl font-bold text-deepRed-700 mb-2">
        Couldn't Load Menu
      </h2>
      <p className="text-spice-500 mb-6 max-w-sm">
        We had trouble fetching the menu. Please check your connection and try again.
      </p>
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
      >
        {isRetrying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </>
        )}
      </Button>
    </div>
  );
}

export default function MenuDisplay() {
  const { data: menuItems, isLoading, isError, isFetching, refetch } = useGetMenuItems();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await refetch();
    setIsRetrying(false);
  };

  const groupedItems = (menuItems ?? []).reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category as unknown as string;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="relative">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src="/assets/generated/punjabi-bites-banner.dim_1200x400.png"
          alt="Punjabi Bites Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-deepRed-900/60 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream-50 mb-2 drop-shadow-lg">
            PUNJABI BITES
          </h1>
          <p className="text-saffron-300 text-lg sm:text-xl font-medium drop-shadow">
            Authentic Flavors, Every Bite
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-saffron-500 mb-4" />
            <p className="text-spice-600 font-medium text-lg">Loading menu...</p>
          </div>
        ) : isError ? (
          <MenuErrorState onRetry={handleRetry} isRetrying={isRetrying} />
        ) : !menuItems || menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed className="h-16 w-16 text-cream-300 mb-4" />
            <h2 className="font-display text-2xl font-bold text-deepRed-700 mb-2">
              Menu Coming Soon
            </h2>
            <p className="text-spice-500 max-w-sm">
              Our chefs are preparing something special. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categoryOrder.map((category) => {
              const catKey = category as unknown as string;
              const items = groupedItems[catKey];
              if (!items || items.length === 0) return null;

              return (
                <section key={catKey}>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-deepRed-700 mb-6 pb-2 border-b-2 border-saffron-300">
                    {categoryLabels[catKey] ?? catKey}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <MenuItemCard key={item.id.toString()} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
