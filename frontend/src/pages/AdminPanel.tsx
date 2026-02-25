import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useGetMenuItems, useDeleteMenuItem, useToggleAvailability } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { MenuItem, Category } from '../backend';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import MenuItemForm from '../components/MenuItemForm';
import PaymentQRCodeManager from '../components/PaymentQRCodeManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChefHat,
  UtensilsCrossed,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.appetizer]: '🥗 Appetizer',
  [Category.mainCourse]: '🍛 Main Course',
  [Category.dessert]: '🍮 Dessert',
  [Category.beverage]: '🥤 Beverage',
};

function AdminMenuRow({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}) {
  const toggleMutation = useToggleAvailability();
  const isToggling = toggleMutation.isPending;

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(item.id);
      toast.success(`${item.name} marked as ${item.isAvailable ? 'Sold Out' : 'Available'}`);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl border border-saffron/15 hover:border-saffron/30 transition-colors group">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-deepRed text-sm md:text-base truncate">
            {item.name}
          </span>
          <Badge variant="outline" className="text-xs border-saffron/30 text-spice shrink-0">
            {CATEGORY_LABELS[item.category]}
          </Badge>
        </div>
        {item.description && (
          <p className="text-gray-500 text-xs mt-0.5 truncate">{item.description}</p>
        )}
        <p className="text-spice font-bold text-sm mt-0.5">₹{item.price.toFixed(0)}</p>
      </div>

      {/* Availability toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-semibold hidden sm:block ${item.isAvailable ? 'text-green-600' : 'text-red-400'}`}>
          {item.isAvailable ? 'Available' : 'Sold Out'}
        </span>
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin text-saffron" />
        ) : (
          <Switch
            checked={item.isAvailable}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-500"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="h-8 w-8 text-gray-400 hover:text-saffron hover:bg-saffron/10"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item)}
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: menuItems, isLoading: menuLoading } = useGetMenuItems();
  const deleteMutation = useDeleteMenuItem();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const isAuthenticated = !!identity;

  // Show loading while actor is initializing or admin status is being checked
  if (actorFetching || adminLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-64 mb-8 bg-saffron/20" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-saffron/10" />
          ))}
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated || !isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync(deleteItem.id);
      toast.success(`"${deleteItem.name}" deleted`);
      setDeleteItem(null);
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const sortedItems = menuItems
    ? [...menuItems].sort((a, b) => {
        const catOrder = [Category.appetizer, Category.mainCourse, Category.dessert, Category.beverage];
        const catDiff = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
        if (catDiff !== 0) return catDiff;
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-deepRed flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-deepRed">
              Menu Manager
            </h1>
            <p className="text-gray-500 text-sm">
              {menuItems?.length ?? 0} item{menuItems?.length !== 1 ? 's' : ''} on the menu
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Payment QR Code Manager */}
      <div className="mb-8">
        <PaymentQRCodeManager />
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-saffron/40 to-transparent" />
        <span className="text-saffron text-sm">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-saffron/40 to-transparent" />
      </div>

      {/* Loading */}
      {menuLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-saffron/10" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!menuLoading && sortedItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-saffron/20">
          <div className="w-16 h-16 rounded-full bg-saffron/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-saffron/60" />
          </div>
          <h3 className="font-display text-xl font-bold text-deepRed mb-2">No Menu Items Yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start building your menu by adding your first item.</p>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        </div>
      )}

      {/* Menu items list */}
      {!menuLoading && sortedItems.length > 0 && (
        <div className="space-y-2.5">
          {sortedItems.map((item) => (
            <AdminMenuRow
              key={item.id.toString()}
              item={item}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black text-deepRed">
              Add New Menu Item
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new item to the menu.
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm
            onSuccess={() => setShowAddDialog(false)}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black text-deepRed">
              Edit Menu Item
            </DialogTitle>
            <DialogDescription>
              Update the details for this menu item.
            </DialogDescription>
          </DialogHeader>
          {editItem && (
            <MenuItemForm
              item={editItem}
              onSuccess={() => setEditItem(null)}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-deepRed">Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteItem?.name}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
