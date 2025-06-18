'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NutritionService, type MealPlanTemplate } from '@/lib/data/nutrition';
import {
  mealPlanTemplateSchema,
  MEAL_PLAN_TYPES,
  type MealPlanTemplateFormData,
} from '@/lib/validations/nutrition';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface MealPlanTemplatesProps {
  onUpdate?: () => void;
}

export function MealPlanTemplates({ onUpdate }: MealPlanTemplatesProps) {
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MealPlanTemplate | null>(null);

  const form = useForm<MealPlanTemplateFormData>({
    resolver: zodResolver(mealPlanTemplateSchema),
    defaultValues: {
      name: '',
      plan_type: 'Maintaining',
      description: '',
      target_calories: 2000,
      target_protein_grams: 150,
      target_carbs_grams: 250,
      target_fat_grams: 65,
    },
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await NutritionService.getAllMealPlanTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load meal plan templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (data: MealPlanTemplateFormData) => {
    try {
      await NutritionService.createMealPlanTemplate(data);
      setIsCreateDialogOpen(false);
      form.reset();
      loadTemplates();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to create meal plan template:', error);
    }
  };

  const handleEditTemplate = async (data: MealPlanTemplateFormData) => {
    if (!selectedTemplate) return;

    try {
      await NutritionService.updateMealPlanTemplate(selectedTemplate.id, data);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      form.reset();
      loadTemplates();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update meal plan template:', error);
    }
  };

  const handleDeleteTemplate = async (template: MealPlanTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    try {
      await NutritionService.deleteMealPlanTemplate(template.id);
      loadTemplates();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete meal plan template:', error);
    }
  };

  const openEditDialog = (template: MealPlanTemplate) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      plan_type: template.plan_type,
      description: template.description || '',
      target_calories: template.target_calories,
      target_protein_grams: template.target_protein_grams,
      target_carbs_grams: template.target_carbs_grams,
      target_fat_grams: template.target_fat_grams,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (template: MealPlanTemplate) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const getPlanTypeIcon = (planType: string) => {
    switch (planType) {
      case 'Cutting':
        return <TrendingDown className="h-4 w-4" />;
      case 'Bulking':
        return <TrendingUp className="h-4 w-4" />;
      case 'Maintaining':
        return <Minus className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPlanTypeColor = (planType: string) => {
    switch (planType) {
      case 'Cutting':
        return 'bg-red-100 text-red-800';
      case 'Bulking':
        return 'bg-green-100 text-green-800';
      case 'Maintaining':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMacroPercentages = (
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ) => {
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;

    return {
      protein: Math.round((proteinCalories / calories) * 100),
      carbs: Math.round((carbCalories / calories) * 100),
      fat: Math.round((fatCalories / calories) * 100),
    };
  };

  const MealPlanForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (data: MealPlanTemplateFormData) => void;
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
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter plan name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plan_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEAL_PLAN_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getPlanTypeIcon(type)}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this meal plan template..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Calories</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2000"
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
            name="target_protein_grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Protein (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="150"
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
            name="target_carbs_grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Carbs (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="250"
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
            name="target_fat_grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Fat (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="65"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <h2 className="text-2xl font-bold">Meal Plan Templates</h2>
          <p className="text-muted-foreground">
            Create and manage meal plan templates for different goals
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Meal Plan Template</DialogTitle>
            </DialogHeader>
            <MealPlanForm
              onSubmit={handleCreateTemplate}
              submitLabel="Create Template"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
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
          {templates.map(template => {
            const macroPercentages = calculateMacroPercentages(
              template.target_calories,
              template.target_protein_grams,
              template.target_carbs_grams,
              template.target_fat_grams
            );

            return (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge
                        className={`mt-2 ${getPlanTypeColor(template.plan_type)}`}
                      >
                        <div className="flex items-center gap-1">
                          {getPlanTypeIcon(template.plan_type)}
                          {template.plan_type}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Calories:</span>{' '}
                        {template.target_calories}
                      </div>
                      <div>
                        <span className="font-medium">Protein:</span>{' '}
                        {template.target_protein_grams}g
                      </div>
                      <div>
                        <span className="font-medium">Carbs:</span>{' '}
                        {template.target_carbs_grams}g
                      </div>
                      <div>
                        <span className="font-medium">Fat:</span>{' '}
                        {template.target_fat_grams}g
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-medium">
                        Macro Distribution
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          P: {macroPercentages.protein}%
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          C: {macroPercentages.carbs}%
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          F: {macroPercentages.fat}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {templates.length === 0 && !loading && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No meal plan templates
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first meal plan template to get started with
                    nutrition planning.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meal Plan Template</DialogTitle>
          </DialogHeader>
          <MealPlanForm
            onSubmit={handleEditTemplate}
            submitLabel="Update Template"
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Meal Plan Details</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedTemplate.name}
                </h3>
                <Badge
                  className={`mt-2 ${getPlanTypeColor(selectedTemplate.plan_type)}`}
                >
                  <div className="flex items-center gap-1">
                    {getPlanTypeIcon(selectedTemplate.plan_type)}
                    {selectedTemplate.plan_type}
                  </div>
                </Badge>
              </div>

              {selectedTemplate.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Nutritional Targets</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">Calories</div>
                    <div className="text-lg">
                      {selectedTemplate.target_calories}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">Protein</div>
                    <div className="text-lg">
                      {selectedTemplate.target_protein_grams}g
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">Carbs</div>
                    <div className="text-lg">
                      {selectedTemplate.target_carbs_grams}g
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">Fat</div>
                    <div className="text-lg">
                      {selectedTemplate.target_fat_grams}g
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Macro Distribution</h4>
                {(() => {
                  const macroPercentages = calculateMacroPercentages(
                    selectedTemplate.target_calories,
                    selectedTemplate.target_protein_grams,
                    selectedTemplate.target_carbs_grams,
                    selectedTemplate.target_fat_grams
                  );
                  return (
                    <div className="flex gap-2">
                      <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm">
                        Protein: {macroPercentages.protein}%
                      </span>
                      <span className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm">
                        Carbs: {macroPercentages.carbs}%
                      </span>
                      <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded text-sm">
                        Fat: {macroPercentages.fat}%
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="text-xs text-muted-foreground">
                Created on{' '}
                {new Date(selectedTemplate.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
