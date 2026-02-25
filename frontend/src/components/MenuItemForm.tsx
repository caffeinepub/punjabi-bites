import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MenuItem, Category } from '../backend';
import { useAddMenuItem, useUpdateMenuItem } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FormValues {
  name: string;
  description: string;
  price: string;
  category: Category;
  imageUrl: string;
}

interface MenuItemFormProps {
  item?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MenuItemForm({ item, onSuccess, onCancel }: MenuItemFormProps) {
  const isEdit = !!item;
  const addMutation = useAddMenuItem();
  const updateMutation = useUpdateMenuItem();
  const isPending = addMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: item?.price?.toString() ?? '',
      category: item?.category ?? Category.mainCourse,
      imageUrl: item?.imageUrl ?? '',
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        imageUrl: item.imageUrl ?? '',
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormValues) => {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const imageUrlValue = data.imageUrl.trim() || null;

    try {
      if (isEdit && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          name: data.name.trim(),
          description: data.description.trim(),
          price,
          category: data.category,
          imageUrl: imageUrlValue,
        });
        toast.success('Menu item updated!');
      } else {
        await addMutation.mutateAsync({
          name: data.name.trim(),
          description: data.description.trim(),
          price,
          category: data.category,
          imageUrl: imageUrlValue,
        });
        toast.success('Menu item added!');
      }
      onSuccess();
    } catch (err) {
      toast.error('Failed to save menu item. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-deepRed font-semibold">Item Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Butter Chicken"
          className="border-saffron/30 focus:border-saffron"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-deepRed font-semibold">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the dish..."
          rows={3}
          className="border-saffron/30 focus:border-saffron resize-none"
          {...register('description')}
        />
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price" className="text-deepRed font-semibold">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="border-saffron/30 focus:border-saffron"
            {...register('price', { required: 'Price is required' })}
          />
          {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-deepRed font-semibold">Category *</Label>
          <Select
            value={selectedCategory}
            onValueChange={(val) => setValue('category', val as Category)}
          >
            <SelectTrigger className="border-saffron/30 focus:border-saffron">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Category.appetizer}>🥗 Appetizer</SelectItem>
              <SelectItem value={Category.mainCourse}>🍛 Main Course</SelectItem>
              <SelectItem value={Category.dessert}>🍮 Dessert</SelectItem>
              <SelectItem value={Category.beverage}>🥤 Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <Label htmlFor="imageUrl" className="text-deepRed font-semibold">Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.jpg"
          className="border-saffron/30 focus:border-saffron"
          {...register('imageUrl')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-saffron hover:bg-saffron/90 text-deepRed font-bold gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Update Item' : 'Add Item'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 border-deepRed/30 text-deepRed hover:bg-deepRed/5"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
