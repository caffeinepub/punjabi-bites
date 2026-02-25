import { useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetMenuItems,
  useDeleteMenuItem,
  useToggleAvailability,
  useUPISettings,
  useUpdateUPISettings,
} from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { MenuItem, Category } from '../backend';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import MenuItemForm from '../components/MenuItemForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  QrCode,
  Upload,
  ImagePlus,
  Save,
  X,
  Smartphone,
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

function UPISettingsManager() {
  const { data: upiSettings, isLoading: upiLoading } = useUPISettings();
  const updateMutation = useUpdateUPISettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize form fields once data loads
  if (!initialized && !upiLoading && upiSettings !== undefined) {
    setUpiId(upiSettings?.upiId ?? '');
    setMerchantName(upiSettings?.merchantName ?? '');
    setInitialized(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setQrPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!upiId.trim()) {
      toast.error('UPI ID cannot be empty.');
      return;
    }
    if (!merchantName.trim()) {
      toast.error('Merchant Name cannot be empty.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        upiId: upiId.trim(),
        merchantName: merchantName.trim(),
        qrCodeData: qrPreview ?? upiSettings?.qrCodeData ?? '',
      });
      toast.success('UPI settings saved successfully!');
      setQrPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to save UPI settings. Please try again.');
    }
  };

  const handleCancelQR = () => {
    setQrPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayQR = qrPreview ?? upiSettings?.qrCodeData;

  return (
    <Card className="border-saffron/20 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-saffron/15 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <CardTitle className="font-display text-lg font-black text-deepRed">
              UPI Settings
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Configure UPI ID, merchant name, and QR code for customer payments
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {upiLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg bg-saffron/10" />
            <Skeleton className="h-10 w-full rounded-lg bg-saffron/10" />
            <Skeleton className="h-44 w-44 rounded-xl bg-saffron/10" />
          </div>
        ) : (
          <>
            {/* UPI ID field */}
            <div className="space-y-1.5">
              <Label htmlFor="upi-id" className="text-sm font-semibold text-deepRed">
                UPI ID
              </Label>
              <Input
                id="upi-id"
                type="text"
                placeholder="e.g. merchant@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="border-saffron/30 focus-visible:ring-saffron/40"
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-gray-400">
                This UPI ID will be used in the payment deep link on mobile devices.
              </p>
            </div>

            {/* Merchant Name field */}
            <div className="space-y-1.5">
              <Label htmlFor="merchant-name" className="text-sm font-semibold text-deepRed">
                Merchant Name
              </Label>
              <Input
                id="merchant-name"
                type="text"
                placeholder="e.g. Punjabi Bites"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="border-saffron/30 focus-visible:ring-saffron/40"
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-gray-400">
                Displayed to customers in the UPI app during payment.
              </p>
            </div>

            {/* QR Code upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-deepRed">Payment QR Code</Label>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* QR preview */}
                <div className="shrink-0">
                  {displayQR ? (
                    <div className="relative group">
                      <img
                        src={displayQR}
                        alt="Payment QR Code"
                        className="w-44 h-44 object-contain rounded-xl border-2 border-saffron/30 bg-white p-2 shadow-sm"
                      />
                      {qrPreview && (
                        <div className="absolute top-1 right-1">
                          <span className="bg-saffron text-deepRed text-xs font-bold px-2 py-0.5 rounded-full">
                            Preview
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-44 h-44 rounded-xl border-2 border-dashed border-saffron/30 bg-saffron/5 flex flex-col items-center justify-center gap-2">
                      <QrCode className="w-10 h-10 text-saffron/40" />
                      <span className="text-xs text-gray-400 text-center px-2">
                        No QR code uploaded yet
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload controls */}
                <div className="flex-1 space-y-3">
                  {upiSettings?.qrCodeData && !qrPreview && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                      <QrCode className="w-4 h-4 shrink-0" />
                      <span className="font-medium">QR code is active for desktop customers</span>
                    </div>
                  )}
                  {qrPreview && (
                    <div className="flex items-center gap-2 text-sm text-saffron bg-saffron/10 rounded-lg px-3 py-2 border border-saffron/20">
                      <ImagePlus className="w-4 h-4 shrink-0" />
                      <span className="font-medium">New QR image selected — save to apply</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Upload a QR code image (PNG, JPG). Shown to desktop customers instead of the deep link button.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="qr-file-input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-saffron/30 text-deepRed hover:bg-saffron/10 hover:border-saffron gap-2"
                      disabled={updateMutation.isPending}
                    >
                      <Upload className="w-4 h-4" />
                      {upiSettings?.qrCodeData ? 'Replace QR Code' : 'Upload QR Code'}
                    </Button>
                    {qrPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelQR}
                        disabled={updateMutation.isPending}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-2 border-t border-saffron/15">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || !upiId.trim() || !merchantName.trim()}
                className="bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2 shadow-md"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updateMutation.isPending ? 'Saving…' : 'Save UPI Settings'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm">
              Manage menu items and payment settings
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

      {/* UPI Settings Manager */}
      <div className="mb-8">
        <UPISettingsManager />
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-saffron/40 to-transparent" />
        <span className="text-saffron text-sm">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-saffron/40 to-transparent" />
      </div>

      {/* Menu Items section header */}
      <div className="flex items-center gap-2 mb-4">
        <ChefHat className="w-5 h-5 text-saffron" />
        <h2 className="font-display text-xl font-black text-deepRed">Menu Items</h2>
        <span className="text-gray-400 text-sm ml-1">
          ({menuItems?.length ?? 0} item{menuItems?.length !== 1 ? 's' : ''})
        </span>
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
