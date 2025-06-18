import { z } from 'zod';

export const FOOD_CATEGORIES = [
  'Meat & Poultry',
  'Eggs',
  'Vegetables',
  'Whole Grains',
  'Legumes',
  'Nuts & Seeds',
  'Plant Oils',
  'Fruits',
] as const;

export const MEAL_PLAN_TYPES = ['Cutting', 'Maintaining', 'Bulking'] as const;
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
export const RECIPE_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const foodSchema = z.object({
  name: z.string().min(1, 'Food name is required').max(255, 'Name too long'),
  category: z.enum(FOOD_CATEGORIES, {
    required_error: 'Please select a food category',
  }),
  calories_per_100g: z
    .number()
    .min(0, 'Calories must be positive')
    .max(2000, 'Calories too high'),
  protein_per_100g: z
    .number()
    .min(0, 'Protein must be positive')
    .max(100, 'Protein too high'),
  carbs_per_100g: z
    .number()
    .min(0, 'Carbs must be positive')
    .max(100, 'Carbs too high'),
  fat_per_100g: z
    .number()
    .min(0, 'Fat must be positive')
    .max(100, 'Fat too high'),
  fiber_per_100g: z
    .number()
    .min(0, 'Fiber must be positive')
    .max(100, 'Fiber too high')
    .nullable()
    .optional(),
  sugar_per_100g: z
    .number()
    .min(0, 'Sugar must be positive')
    .max(100, 'Sugar too high')
    .nullable()
    .optional(),
  sodium_per_100g: z
    .number()
    .min(0, 'Sodium must be positive')
    .max(10000, 'Sodium too high')
    .nullable()
    .optional(),
  is_starchy_vegetable: z.boolean().optional(),
  meal_types: z.array(z.enum(MEAL_TYPES)).optional(),
  restrictions: z.record(z.any()).optional(),
});

export const mealPlanTemplateSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(255, 'Name too long'),
  plan_type: z.enum(MEAL_PLAN_TYPES, {
    required_error: 'Please select a plan type',
  }),
  description: z.string().max(1000, 'Description too long').optional(),
  target_calories: z
    .number()
    .min(800, 'Calories too low')
    .max(6000, 'Calories too high'),
  target_protein_grams: z
    .number()
    .min(20, 'Protein too low')
    .max(400, 'Protein too high'),
  target_carbs_grams: z
    .number()
    .min(20, 'Carbs too low')
    .max(800, 'Carbs too high'),
  target_fat_grams: z.number().min(10, 'Fat too low').max(200, 'Fat too high'),
});

export const recipeSchema = z.object({
  title: z
    .string()
    .min(1, 'Recipe title is required')
    .max(255, 'Title too long'),
  cook_time: z
    .string()
    .min(1, 'Cook time is required')
    .max(50, 'Cook time too long'),
  difficulty: z.enum(RECIPE_DIFFICULTIES, {
    required_error: 'Please select difficulty level',
  }),
  calories: z
    .number()
    .min(0, 'Calories must be positive')
    .max(5000, 'Calories too high'),
  protein: z
    .number()
    .min(0, 'Protein must be positive')
    .max(200, 'Protein too high'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category too long'),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  emoji_fallback: z.string().max(10, 'Emoji too long').optional(),
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .min(1, 'At least one ingredient is required'),
  instructions: z
    .array(z.string().min(1, 'Instruction cannot be empty'))
    .min(1, 'At least one instruction is required'),
});

export const userMealPlanSchema = z.object({
  template_id: z.number().min(1, 'Template is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// Form data types
export type FoodFormData = z.infer<typeof foodSchema>;
export type MealPlanTemplateFormData = z.infer<typeof mealPlanTemplateSchema>;
export type RecipeFormData = z.infer<typeof recipeSchema>;
export type UserMealPlanFormData = z.infer<typeof userMealPlanSchema>;

// Validation helpers
export const validateNutritionValues = (
  calories: number,
  protein: number,
  carbs: number,
  fat: number
) => {
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalculated = proteinCalories + carbCalories + fatCalories;

  // Allow 10% variance in calorie calculation
  const variance = Math.abs(calories - totalCalculated) / calories;

  return {
    isValid: variance <= 0.1,
    calculatedCalories: totalCalculated,
    variance: variance * 100,
    macroBreakdown: {
      protein: Math.round((proteinCalories / calories) * 100),
      carbs: Math.round((carbCalories / calories) * 100),
      fat: Math.round((fatCalories / calories) * 100),
    },
  };
};

export const calculateMacroDistribution = (
  calories: number,
  protein: number,
  carbs: number,
  fat: number
) => {
  const proteinPercent = Math.round(((protein * 4) / calories) * 100);
  const carbPercent = Math.round(((carbs * 4) / calories) * 100);
  const fatPercent = Math.round(((fat * 9) / calories) * 100);

  return {
    protein: proteinPercent,
    carbs: carbPercent,
    fat: fatPercent,
    total: proteinPercent + carbPercent + fatPercent,
  };
};
