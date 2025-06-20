'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NutritionService, type Food } from '@/lib/data/nutrition';
import {
  foodSchema,
  FOOD_CATEGORIES,
  type FoodFormData,
} from '@/lib/validations/nutrition';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface FoodManagementProps {
  onUpdate?: () => void;
}

export function FoodManagement({ onUpdate }: FoodManagementProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const form = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: '',
      category: 'Vegetables',
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 0,
      fiber_per_100g: 0,
      sugar_per_100g: 0,
      sodium_per_100g: 0,
      is_starchy_vegetable: false,
      meal_types: [],
      restrictions: {},
    },
  });

  useEffect(() => {
    loadFoods();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const data = await NutritionService.getAllFoods(
        itemsPerPage,
        offset,
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchTerm || undefined
      );
      setFoods(data);

      // Calculate total pages (this is a simplified calculation)
      const totalCount =
        data.length === itemsPerPage
          ? currentPage * itemsPerPage + 1
          : currentPage * itemsPerPage;
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error('Failed to load foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFood = async (data: FoodFormData) => {
    try {
      // Convert undefined to null for fields that expect number | null
      const foodData = {
        ...data,
        fiber_per_100g: data.fiber_per_100g ?? null,
        sugar_per_100g: data.sugar_per_100g ?? null,
        sodium_per_100g: data.sodium_per_100g ?? null,
        is_starchy_vegetable: data.is_starchy_vegetable ?? null,
        meal_types: data.meal_types as
          | ('Breakfast' | 'Lunch' | 'Dinner' | 'Snacks')[]
          | null,
        restrictions: data.restrictions ?? null,
      };
      await NutritionService.createFood(foodData);
      setIsCreateDialogOpen(false);
      form.reset();
      loadFoods();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to create food:', error);
    }
  };

  const handleEditFood = async (data: FoodFormData) => {
    if (!selectedFood) return;

    try {
      // Convert undefined to null for fields that expect number | null
      const foodData = {
        ...data,
        fiber_per_100g: data.fiber_per_100g ?? null,
        sugar_per_100g: data.sugar_per_100g ?? null,
        sodium_per_100g: data.sodium_per_100g ?? null,
        is_starchy_vegetable: data.is_starchy_vegetable ?? null,
        meal_types: data.meal_types as
          | ('Breakfast' | 'Lunch' | 'Dinner' | 'Snacks')[]
          | null,
        restrictions: data.restrictions ?? null,
      };
      await NutritionService.updateFood(selectedFood.id, foodData);
      setIsEditDialogOpen(false);
      setSelectedFood(null);
      form.reset();
      loadFoods();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update food:', error);
    }
  };

  const handleDeleteFood = async (food: Food) => {
    if (!confirm(`Are you sure you want to delete "${food.name}"?`)) return;

    try {
      await NutritionService.deleteFood(food.id);
      loadFoods();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const openEditDialog = (food: Food) => {
    setSelectedFood(food);
    form.reset({
      name: food.name,
      category: food.category,
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
      fiber_per_100g: food.fiber_per_100g || 0,
      sugar_per_100g: food.sugar_per_100g || 0,
      sodium_per_100g: food.sodium_per_100g || 0,
      is_starchy_vegetable: food.is_starchy_vegetable || false,
      meal_types: food.meal_types
        ? food.meal_types.filter(
            (type): type is 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' =>
              ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(type)
          )
        : [],
      restrictions: food.restrictions || {},
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (food: Food) => {
    setSelectedFood(food);
    setIsViewDialogOpen(true);
  };

  const exportFoods = async (format: 'json' | 'csv') => {
    try {
      const data = await NutritionService.exportFoods(format);
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foods.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export foods:', error);
    }
  };

  const FoodForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (data: FoodFormData) => void;
    submitLabel: string;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter food name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FOOD_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories per 100g</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protein_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein per 100g (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="carbs_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs per 100g (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fat_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat per 100g (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="fiber_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fiber per 100g (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(Number(e.target.value) || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sugar_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sugar per 100g (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(Number(e.target.value) || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sodium_per_100g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sodium per 100g (mg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(Number(e.target.value) || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_starchy_vegetable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is Starchy Vegetable</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Food Database</h2>
          <p className="text-muted-foreground">
            Manage nutritional information for foods
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => exportFoods('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportFoods('json')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Food
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Food</DialogTitle>
              </DialogHeader>
              <FoodForm onSubmit={handleCreateFood} submitLabel="Create Food" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FOOD_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Foods Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading foods...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Calories/100g</TableHead>
                  <TableHead>Protein</TableHead>
                  <TableHead>Carbs</TableHead>
                  <TableHead>Fat</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foods.map(food => (
                  <TableRow key={food.id}>
                    <TableCell className="font-medium">{food.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{food.category}</Badge>
                    </TableCell>
                    <TableCell>{food.calories_per_100g}</TableCell>
                    <TableCell>{food.protein_per_100g}g</TableCell>
                    <TableCell>{food.carbs_per_100g}g</TableCell>
                    <TableCell>{food.fat_per_100g}g</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(food)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(food)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFood(food)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
          </DialogHeader>
          <FoodForm onSubmit={handleEditFood} submitLabel="Update Food" />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Food Details</DialogTitle>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedFood.name}</h3>
                <Badge variant="secondary">{selectedFood.category}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Calories:</span>{' '}
                  {selectedFood.calories_per_100g}/100g
                </div>
                <div>
                  <span className="font-medium">Protein:</span>{' '}
                  {selectedFood.protein_per_100g}g
                </div>
                <div>
                  <span className="font-medium">Carbs:</span>{' '}
                  {selectedFood.carbs_per_100g}g
                </div>
                <div>
                  <span className="font-medium">Fat:</span>{' '}
                  {selectedFood.fat_per_100g}g
                </div>
                {selectedFood.fiber_per_100g && (
                  <div>
                    <span className="font-medium">Fiber:</span>{' '}
                    {selectedFood.fiber_per_100g}g
                  </div>
                )}
                {selectedFood.sugar_per_100g && (
                  <div>
                    <span className="font-medium">Sugar:</span>{' '}
                    {selectedFood.sugar_per_100g}g
                  </div>
                )}
                {selectedFood.sodium_per_100g && (
                  <div>
                    <span className="font-medium">Sodium:</span>{' '}
                    {selectedFood.sodium_per_100g}mg
                  </div>
                )}
              </div>

              {selectedFood.is_starchy_vegetable && (
                <Badge variant="outline">Starchy Vegetable</Badge>
              )}

              <div className="text-xs text-muted-foreground">
                Added on{' '}
                {new Date(selectedFood.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
