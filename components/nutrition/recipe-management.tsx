'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChefHat,
  Clock,
  Utensils,
  Star,
  X,
} from 'lucide-react';
import { useForm, useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NutritionService, type Recipe } from '@/lib/data/nutrition';
import {
  recipeSchema,
  RECIPE_DIFFICULTIES,
  type RecipeFormData,
} from '@/lib/validations/nutrition';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface RecipeManagementProps {
  onUpdate?: () => void;
}

export function RecipeManagement({ onUpdate }: RecipeManagementProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      cook_time: '',
      difficulty: 'Easy',
      calories: 0,
      protein: 0,
      category: '',
      thumbnail_url: '',
      video_url: '',
      emoji_fallback: '🍽️',
      ingredients: [''],
      instructions: [''],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control as any,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control as any,
    name: 'instructions',
  });

  useEffect(() => {
    loadRecipes();
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await NutritionService.getAllRecipes(
        50,
        0,
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchTerm || undefined
      );
      // Filter by difficulty if selected
      const filteredData =
        selectedDifficulty && selectedDifficulty !== 'all'
          ? data.filter(recipe => recipe.difficulty === selectedDifficulty)
          : data;
      setRecipes(filteredData);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async (data: RecipeFormData) => {
    try {
      // Convert form data to Recipe format
      const recipeData = {
        ...data,
        thumbnail_url: data.thumbnail_url || null,
        video_url: data.video_url || null,
        emoji_fallback: data.emoji_fallback || null,
      };
      await NutritionService.createRecipe(recipeData);
      setIsCreateDialogOpen(false);
      form.reset();
      loadRecipes();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to create recipe:', error);
    }
  };

  const handleEditRecipe = async (data: RecipeFormData) => {
    if (!selectedRecipe) return;

    try {
      // Convert form data to Recipe format
      const recipeData = {
        ...data,
        thumbnail_url: data.thumbnail_url || null,
        video_url: data.video_url || null,
        emoji_fallback: data.emoji_fallback || null,
      };
      await NutritionService.updateRecipe(selectedRecipe.id, recipeData);
      setIsEditDialogOpen(false);
      setSelectedRecipe(null);
      form.reset();
      loadRecipes();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update recipe:', error);
    }
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!confirm(`Are you sure you want to delete "${recipe.title}"?`)) return;

    try {
      await NutritionService.deleteRecipe(recipe.id);
      loadRecipes();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const openEditDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    form.reset({
      title: recipe.title,
      cook_time: recipe.cook_time,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      protein: recipe.protein,
      category: recipe.category,
      thumbnail_url: recipe.thumbnail_url || '',
      video_url: recipe.video_url || '',
      emoji_fallback: recipe.emoji_fallback || '🍽️',
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsViewDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueCategories = (recipes: Recipe[]) => {
    const categories = [...new Set(recipes.map(recipe => recipe.category))];
    return categories.filter(Boolean);
  };

  const RecipeForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (data: RecipeFormData) => void;
    submitLabel: string;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter recipe title" {...field} />
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
                <FormControl>
                  <Input
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                    {...field}
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
            name="cook_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 30 mins" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECIPE_DIFFICULTIES.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emoji_fallback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji</FormLabel>
                <FormControl>
                  <Input placeholder="🍽️" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories</FormLabel>
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
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Ingredients</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendIngredient('')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`ingredients.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Enter ingredient" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {ingredientFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Instructions</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendInstruction('')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <FormField
                  control={form.control}
                  name={`instructions.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Enter instruction step"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {instructionFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

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
          <h2 className="text-2xl font-bold">Recipe Management</h2>
          <p className="text-muted-foreground">
            Manage recipes with ingredients and instructions
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
            </DialogHeader>
            <RecipeForm
              onSubmit={handleCreateRecipe}
              submitLabel="Create Recipe"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
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
                {getUniqueCategories(recipes).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {RECIPE_DIFFICULTIES.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-3 w-20 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-300 rounded"></div>
                  <div className="h-3 w-full bg-gray-300 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{recipe.emoji_fallback}</span>
                      <CardTitle className="text-lg line-clamp-1">
                        {recipe.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{recipe.category}</Badge>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(recipe)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(recipe)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecipe(recipe)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.cook_time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4" />
                      {recipe.calories} cal
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Protein:</span>{' '}
                    {recipe.protein}g
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {recipe.ingredients.length} ingredients •{' '}
                    {recipe.instructions.length} steps
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {recipes.length === 0 && !loading && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No recipes found
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first recipe to start building your collection.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          <RecipeForm onSubmit={handleEditRecipe} submitLabel="Update Recipe" />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recipe Details</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {selectedRecipe.emoji_fallback}
                </span>
                <div>
                  <h3 className="font-semibold text-xl">
                    {selectedRecipe.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{selectedRecipe.category}</Badge>
                    <Badge
                      className={getDifficultyColor(selectedRecipe.difficulty)}
                    >
                      {selectedRecipe.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded">
                  <div className="font-medium">Cook Time</div>
                  <div className="text-lg">{selectedRecipe.cook_time}</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="font-medium">Calories</div>
                  <div className="text-lg">{selectedRecipe.calories}</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="font-medium">Protein</div>
                  <div className="text-lg">{selectedRecipe.protein}g</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Ingredients</h4>
                <ul className="space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Instructions</h4>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">{instruction}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="text-xs text-muted-foreground">
                Created on{' '}
                {new Date(selectedRecipe.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
