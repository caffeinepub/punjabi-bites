import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetMenuItems, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MenuItem, Category } from '../backend';
import MenuItemCard from '../components/MenuItemCard';
import CartSidebar from '../components/CartSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Settings, RefreshCw, AlertCircle } from 'lucide-react';

const CATEGORY_ORDER: Category[] = [
  Category.appetizer,
  Category.mainCourse,
  Category.dessert,
  Category.beverage,
];

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.appetizer]: 'Appetizers',
  [Category.mainCourse]: 'Main Course',
  [Category.dessert]: 'Desserts',
  [Category.beverage]: 'Beverages',
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  [Category.appetizer]: 'Start your meal with our flavorful starters',
  [Category.mainCourse]: 'Hearty Punjabi classics cooked to perfection',
  [Category.dessert]: 'Sweet endings to a perfect meal',
  [Category.beverage]: 'Refreshing drinks to complement your food',
};

const CATEGORY_ICONS: Record<Category, string> = {
  [Category.appetizer]: '🥗',
  [Category.mainCourse]: '🍛',
  [Category.dessert]: '🍮',
  [Category.beverage]: '🥤',
};

function CategorySection({ category, items }: { category: Category; items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{CATEGORY_ICONS[category]}</span>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-deepRed leading-none">
            {CATEGORY_LABELS[category]}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-saffron/40 to-transparent ml-4 hidden sm:block" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {items.map((item) => (
          <MenuItemCard key={item.id.toString()} item={item} />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2].map((s) => (
        <div key={s}>
          <Skeleton className="h-8 w-48 mb-6 bg-saffron/20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-saffron/10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h2 className="font-display text-2xl font-black text-deepRed mb-2">
        Couldn't Load Menu
      </h2>
      <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
        We had trouble fetching the menu. This is usually temporary — please try again.
      </p>
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-deepRed hover:bg-deepRed/90 text-white gap-2 font-semibold"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Loading…' : 'Try Again'}
      </Button>
    </div>
  );
}

export default function MenuDisplay() {
  const { data: menuItems, isLoading, isFetching, error, refetch } = useGetMenuItems();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const isAuthenticated = !!identity;
  const [cartOpen, setCartOpen] = useState(false);

  const showAdminCTA = isAuthenticated && !isAdminLoading && isAdmin === true;

  const grouped = useMemo(() => {
    if (!menuItems) return {} as Record<Category, MenuItem[]>;
    return menuItems.reduce((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<Category, MenuItem[]>);
  }, [menuItems]);

  const hasItems = menuItems && menuItems.length > 0;

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-deepRed">
        <img
          src="/assets/generated/punjabi-bites-banner.dim_1200x400.png"
          alt="Punjabi Bites — Authentic Flavors"
          className="w-full h-48 sm:h-64 md:h-80 object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <img
            src="/assets/generated/punjabi-bites-logo.dim_400x200.png"
            alt="Punjabi Bites"
            className="h-16 sm:h-20 md:h-24 object-contain mb-2 drop-shadow-lg"
          />
          <p className="text-cream/90 text-sm sm:text-base font-medium tracking-wide drop-shadow">
            Authentic Punjabi Flavors, Served Fresh Daily
          </p>
        </div>
      </div>

      {/* Action Bar — Admin CTA */}
      {showAdminCTA && (
        <div className="bg-white border-b border-saffron/15 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-3">
            <Link to="/admin">
              <Button
                variant="outline"
                className="border-saffron/40 text-deepRed hover:bg-saffron/10 gap-2 font-semibold"
              >
                <Settings className="w-4 h-4" />
                Manage Menu
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-deepRed mb-2">
            Today's Menu
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-saffron/50" />
            <span className="text-saffron text-lg">✦</span>
            <div className="h-px w-16 bg-saffron/50" />
          </div>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Freshly prepared with love and authentic spices
          </p>
        </div>

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <MenuErrorState onRetry={refetch} isRetrying={isFetching} />
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasItems && (
          <div className="text-center py-20 bg-white rounded-2xl border border-saffron/20">
            <div className="w-20 h-20 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-5">
              <UtensilsCrossed className="w-10 h-10 text-saffron/50" />
            </div>
            <h2 className="font-display text-2xl font-black text-deepRed mb-2">Menu Coming Soon</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Our chefs are preparing something special. Check back soon!
            </p>
          </div>
        )}

        {/* Menu categories */}
        {!isLoading && !error && hasItems && (
          <div>
            {CATEGORY_ORDER.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                items={grouped[cat] ?? []}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
