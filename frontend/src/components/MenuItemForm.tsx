import { useForm } from 'react-hook-form';
import { MenuItem, Category } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: Category;
  imageUrl: string;
}

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    category: Category;
    imageUrl: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MenuItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: MenuItemFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price?.toString() ?? '',
      category: initialData?.category ?? Category.mainCourse,
      imageUrl: initialData?.imageUrl ?? '',
    },
  });

  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: MenuItemFormData) => {
    await onSubmit({
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category,
      imageUrl: data.imageUrl.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-deepRed-700 font-medium">
          Item Name *
        </Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g. Butter Chicken"
          className="mt-1 border-cream-300 focus:border-saffron-400"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-deepRed-700 font-medium">
          Description *
        </Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Describe the dish..."
          rows={3}
          className="mt-1 border-cream-300 focus:border-saffron-400"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="price" className="text-deepRed-700 font-medium">
          Price (₹) *
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Price must be positive' },
          })}
          placeholder="e.g. 250.00"
          className="mt-1 border-cream-300 focus:border-saffron-400"
        />
        {errors.price && (
          <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
        )}
      </div>

      <div>
        <Label className="text-deepRed-700 font-medium">Category *</Label>
        <Select
          value={selectedCategory}
          onValueChange={(val) => setValue('category', val as Category)}
        >
          <SelectTrigger className="mt-1 border-cream-300 focus:border-saffron-400">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Category.appetizer}>Appetizer</SelectItem>
            <SelectItem value={Category.mainCourse}>Main Course</SelectItem>
            <SelectItem value={Category.dessert}>Dessert</SelectItem>
            <SelectItem value={Category.beverage}>Beverage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="imageUrl" className="text-deepRed-700 font-medium">
          Image URL (optional)
        </Label>
        <Input
          id="imageUrl"
          {...register('imageUrl')}
          placeholder="https://example.com/image.jpg"
          className="mt-1 border-cream-300 focus:border-saffron-400"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-saffron-500 hover:bg-saffron-400 text-deepRed-900 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : initialData ? (
            'Update Item'
          ) : (
            'Add Item'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border-deepRed-300 text-deepRed-600 hover:bg-deepRed-50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
