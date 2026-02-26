import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetMenuItems,
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleAvailability,
  useGetUpiSettings,
  useUpdateUpiSettings,
} from '../hooks/useQueries';
import { MenuItem, Category } from '../backend';
import MenuItemForm from '../components/MenuItemForm';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UtensilsCrossed,
  Save,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
  [Category.appetizer]: 'Appetizer',
  [Category.mainCourse]: 'Main Course',
  [Category.dessert]: 'Dessert',
  [Category.beverage]: 'Beverage',
};

function UPISettingsManager() {
  const { data: upiSettings, isLoading: settingsLoading } = useGetUpiSettings();
  const updateUpiSettings = useUpdateUpiSettings();

  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize form from fetched data once
  if (!initialized && upiSettings !== undefined && upiSettings !== null) {
    setUpiId(upiSettings.upiId);
    setMerchantName(upiSettings.merchantName);
    setQrCodeData(upiSettings.qrCodeData);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!upiId.trim() || !merchantName.trim()) {
      toast.error('UPI ID and Merchant Name are required');
      return;
    }
    try {
      await updateUpiSettings.mutateAsync({
        upiId: upiId.trim(),
        merchantName: merchantName.trim(),
        qrCodeData: qrCodeData.trim(),
      });
      toast.success('UPI settings saved successfully!');
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message ?? 'Unknown error'}`);
    }
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQrCodeData((ev.target?.result as string) ?? '');
    };
    reader.readAsDataURL(file);
  };

  if (settingsLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-saffron-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-saffron-200">
      <CardHeader className="bg-saffron-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-deepRed-800 font-display">
          <QrCode className="h-5 w-5 text-saffron-600" />
          UPI Payment Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="upiId" className="text-deepRed-700 font-medium">
              UPI ID *
            </Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-1 border-cream-300 focus:border-saffron-400"
            />
          </div>
          <div>
            <Label htmlFor="merchantName" className="text-deepRed-700 font-medium">
              Merchant Name *
            </Label>
            <Input
              id="merchantName"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Punjabi Bites"
              className="mt-1 border-cream-300 focus:border-saffron-400"
            />
          </div>
        </div>

        <div>
          <Label className="text-deepRed-700 font-medium">QR Code Image</Label>
          <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrImageUpload}
                className="block text-sm text-spice-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-saffron-100 file:text-deepRed-700 hover:file:bg-saffron-200 cursor-pointer"
              />
              <p className="text-xs text-spice-400 mt-1">Upload a QR code image (PNG, JPG)</p>
            </div>
            {qrCodeData && (
              <div className="border border-cream-200 rounded-lg p-2 bg-white">
                <img
                  src={qrCodeData}
                  alt="QR Code Preview"
                  className="h-24 w-24 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateUpiSettings.isPending}
          className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
        >
          {updateUpiSettings.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save UPI Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: menuItems, isLoading: itemsLoading } = useGetMenuItems();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const toggleAvailability = useToggleAvailability();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-saffron-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleAdd = async (data: {
    name: string;
    description: string;
    price: number;
    category: Category;
    imageUrl: string | null;
  }) => {
    try {
      await addMenuItem.mutateAsync(data);
      toast.success('Menu item added!');
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(`Failed to add item: ${err.message ?? 'Unknown error'}`);
    }
  };

  const handleUpdate = async (data: {
    name: string;
    description: string;
    price: number;
    category: Category;
    imageUrl: string | null;
  }) => {
    if (!editingItem) return;
    try {
      await updateMenuItem.mutateAsync({ id: editingItem.id, ...data });
      toast.success('Menu item updated!');
      setEditingItem(null);
    } catch (err: any) {
      toast.error(`Failed to update item: ${err.message ?? 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (deletingItemId === null) return;
    try {
      await deleteMenuItem.mutateAsync(deletingItemId);
      toast.success('Menu item deleted!');
      setDeletingItemId(null);
    } catch (err: any) {
      toast.error(`Failed to delete item: ${err.message ?? 'Unknown error'}`);
    }
  };

  const handleToggle = async (id: bigint) => {
    try {
      await toggleAvailability.mutateAsync(id);
      toast.success('Availability updated!');
    } catch (err: any) {
      toast.error(`Failed to toggle: ${err.message ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-saffron-100 rounded-full p-3">
          <ShieldCheck className="h-8 w-8 text-saffron-600" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-deepRed-800">Admin Panel</h1>
          <p className="text-spice-600">Manage your restaurant menu and settings</p>
        </div>
      </div>

      {/* UPI Settings */}
      <UPISettingsManager />

      {/* Menu Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-deepRed-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-deepRed-800 font-display">
            <UtensilsCrossed className="h-5 w-5 text-deepRed-600" />
            Menu Items
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
            </div>
          ) : !menuItems || menuItems.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-cream-300 mx-auto mb-3" />
              <p className="text-spice-500 font-medium">No menu items yet</p>
              <p className="text-spice-400 text-sm mt-1">
                Click "Add Item" to create your first menu item
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex items-center gap-4 p-4 bg-cream-50 rounded-lg border border-cream-200 hover:border-saffron-200 transition-colors"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-deepRed-800 truncate">{item.name}</h3>
                      <Badge
                        variant="outline"
                        className="text-xs border-saffron-200 text-saffron-700"
                      >
                        {categoryLabels[item.category as unknown as string] ?? item.category}
                      </Badge>
                      <Badge
                        variant={item.isAvailable ? 'default' : 'secondary'}
                        className={
                          item.isAvailable
                            ? 'bg-green-100 text-green-700 border-green-200 text-xs'
                            : 'bg-gray-100 text-gray-500 text-xs'
                        }
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <p className="text-spice-500 text-sm mt-1 truncate">{item.description}</p>
                    <p className="text-saffron-600 font-bold text-sm mt-1">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleToggle(item.id)}
                      disabled={toggleAvailability.isPending}
                      className="h-8 w-8 border-cream-300 hover:border-saffron-300"
                      title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                    >
                      {item.isAvailable ? (
                        <EyeOff className="h-4 w-4 text-spice-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      className="h-8 w-8 border-cream-300 hover:border-saffron-300"
                      title="Edit item"
                    >
                      <Pencil className="h-4 w-4 text-spice-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setDeletingItemId(item.id)}
                      className="h-8 w-8 border-cream-300 hover:border-red-300 hover:text-red-600"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-deepRed-800">Add Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isLoading={addMenuItem.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-deepRed-800">Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <MenuItemForm
              initialData={editingItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
              isLoading={updateMenuItem.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingItemId !== null}
        onOpenChange={(open) => !open && setDeletingItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-deepRed-800">
              Delete Menu Item?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-spice-600">
              This action cannot be undone. The menu item will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-cream-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMenuItem.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMenuItem.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
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
