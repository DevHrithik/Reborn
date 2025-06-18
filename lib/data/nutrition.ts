import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Food {
  id: number;
  name: string;
  category:
    | 'Meat & Poultry'
    | 'Eggs'
    | 'Vegetables'
    | 'Whole Grains'
    | 'Legumes'
    | 'Nuts & Seeds'
    | 'Plant Oils'
    | 'Fruits';
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number | null;
  sugar_per_100g: number | null;
  sodium_per_100g: number | null;
  is_starchy_vegetable: boolean | null;
  meal_types: string[] | null;
  restrictions: any | null;
  created_at: string;
}

export interface MealPlanTemplate {
  id: number;
  name: string;
  plan_type: 'Cutting' | 'Maintaining' | 'Bulking';
  description: string | null;
  target_calories: number;
  target_protein_grams: number;
  target_carbs_grams: number;
  target_fat_grams: number;
  created_at: string;
}

export interface Recipe {
  id: number;
  title: string;
  cook_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  protein: number;
  category: string;
  thumbnail_url: string | null;
  video_url: string | null;
  emoji_fallback: string | null;
  ingredients: string[];
  instructions: string[];
  created_at: string;
}

export interface UserMealPlan {
  id: number;
  user_id: string;
  template_id: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserDailyMeal {
  id: number;
  user_id: string | null;
  meal_plan_id: number | null;
  meal_date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  is_saved: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface MealFoodSelection {
  id: number;
  daily_meal_id: number | null;
  food_id: number | null;
  portion_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

export interface NutritionStats {
  totalFoods: number;
  totalMealPlans: number;
  totalRecipes: number;
  activeMealPlans: number;
  foodsByCategory: Array<{ category: string; count: number }>;
  recentlyAdded: {
    foods: Food[];
    recipes: Recipe[];
    mealPlans: MealPlanTemplate[];
  };
}

export class NutritionService {
  // Food Operations
  static async getAllFoods(
    limit: number = 20,
    offset: number = 0,
    category?: string,
    search?: string
  ): Promise<Food[]> {
    let query = supabase
      .from('foods')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching foods:', error);
      throw error;
    }

    return data || [];
  }

  static async getFoodById(id: number) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Food;
  }

  static async createFood(
    foodData: Omit<Food, 'id' | 'created_at'>
  ): Promise<Food> {
    const { data, error } = await supabase
      .from('foods')
      .insert([foodData])
      .select()
      .single();

    if (error) {
      console.error('Error creating food:', error);
      throw error;
    }

    return data;
  }

  static async updateFood(
    id: number,
    foodData: Partial<Omit<Food, 'id' | 'created_at'>>
  ): Promise<Food> {
    const { data, error } = await supabase
      .from('foods')
      .update(foodData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating food:', error);
      throw error;
    }

    return data;
  }

  static async deleteFood(id: number): Promise<void> {
    const { error } = await supabase.from('foods').delete().eq('id', id);

    if (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  }

  static async getFoodsByCategory() {
    const { data, error } = await supabase
      .from('foods')
      .select('category')
      .order('category');

    if (error) throw error;

    const counts = data.reduce((acc: { [key: string]: number }, food) => {
      acc[food.category] = (acc[food.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));
  }

  // Meal Plan Template Operations
  static async getAllMealPlanTemplates(): Promise<MealPlanTemplate[]> {
    const { data, error } = await supabase
      .from('meal_plan_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal plan templates:', error);
      throw error;
    }

    return data || [];
  }

  static async getMealPlanTemplateById(id: number) {
    const { data, error } = await supabase
      .from('meal_plan_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MealPlanTemplate;
  }

  static async createMealPlanTemplate(
    templateData: Omit<MealPlanTemplate, 'id' | 'created_at'>
  ): Promise<MealPlanTemplate> {
    const { data, error } = await supabase
      .from('meal_plan_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan template:', error);
      throw error;
    }

    return data;
  }

  static async updateMealPlanTemplate(
    id: number,
    templateData: Partial<Omit<MealPlanTemplate, 'id' | 'created_at'>>
  ): Promise<MealPlanTemplate> {
    const { data, error } = await supabase
      .from('meal_plan_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal plan template:', error);
      throw error;
    }

    return data;
  }

  static async deleteMealPlanTemplate(id: number): Promise<void> {
    const { error } = await supabase
      .from('meal_plan_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal plan template:', error);
      throw error;
    }
  }

  // Recipe Operations
  static async getAllRecipes(
    limit: number = 20,
    offset: number = 0,
    category?: string,
    search?: string
  ): Promise<Recipe[]> {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    return data || [];
  }

  static async getRecipeById(id: number) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Recipe;
  }

  static async createRecipe(
    recipeData: Omit<Recipe, 'id' | 'created_at'>
  ): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }

    return data;
  }

  static async updateRecipe(
    id: number,
    recipeData: Partial<Omit<Recipe, 'id' | 'created_at'>>
  ): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }

    return data;
  }

  static async deleteRecipe(id: number): Promise<void> {
    const { error } = await supabase.from('recipes').delete().eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  // User Meal Plan Operations
  static async getUserMealPlans(userId: string): Promise<UserMealPlan[]> {
    const { data, error } = await supabase
      .from('user_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user meal plans:', error);
      throw error;
    }

    return data || [];
  }

  static async createUserMealPlan(
    planData: Omit<UserMealPlan, 'id' | 'created_at'>
  ): Promise<UserMealPlan> {
    const { data, error } = await supabase
      .from('user_meal_plans')
      .insert([planData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user meal plan:', error);
      throw error;
    }

    return data;
  }

  static async updateUserMealPlan(
    id: number,
    planData: Partial<Omit<UserMealPlan, 'id' | 'created_at'>>
  ): Promise<UserMealPlan> {
    const { data, error } = await supabase
      .from('user_meal_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user meal plan:', error);
      throw error;
    }

    return data;
  }

  static async deleteUserMealPlan(id: number): Promise<void> {
    const { error } = await supabase
      .from('user_meal_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user meal plan:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  static async getNutritionStats(): Promise<NutritionStats> {
    try {
      // Get counts
      const [foodsResult, templatesResult, recipesResult, activePlansResult] =
        await Promise.all([
          supabase.from('foods').select('id', { count: 'exact' }),
          supabase.from('meal_plan_templates').select('id', { count: 'exact' }),
          supabase.from('recipes').select('id', { count: 'exact' }),
          supabase
            .from('user_meal_plans')
            .select('id', { count: 'exact' })
            .eq('is_active', true),
        ]);

      // Get foods by category
      const { data: categoryData } = await supabase
        .from('foods')
        .select('category')
        .order('category');

      const categoryStats =
        categoryData?.reduce(
          (acc, food) => {
            acc[food.category] = (acc[food.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const foodsByCategory = Object.entries(categoryStats).map(
        ([category, count]) => ({
          category,
          count,
        })
      );

      // Get recently added items
      const [recentFoods, recentRecipes, recentMealPlans] = await Promise.all([
        supabase
          .from('foods')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('meal_plan_templates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      return {
        totalFoods: foodsResult.count || 0,
        totalMealPlans: templatesResult.count || 0,
        totalRecipes: recipesResult.count || 0,
        activeMealPlans: activePlansResult.count || 0,
        foodsByCategory,
        recentlyAdded: {
          foods: recentFoods.data || [],
          recipes: recentRecipes.data || [],
          mealPlans: recentMealPlans.data || [],
        },
      };
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      throw error;
    }
  }

  // Bulk Import/Export
  static async bulkImportFoods(foods: Omit<Food, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase.from('foods').insert(foods).select();

    if (error) throw error;
    return data as Food[];
  }

  static async exportFoods(format: 'json' | 'csv'): Promise<string> {
    const foods = await this.getAllFoods(1000); // Get all foods

    if (format === 'json') {
      return JSON.stringify(foods, null, 2);
    } else {
      // CSV format
      const headers = [
        'id',
        'name',
        'category',
        'calories_per_100g',
        'protein_per_100g',
        'carbs_per_100g',
        'fat_per_100g',
        'fiber_per_100g',
        'sugar_per_100g',
        'sodium_per_100g',
        'is_starchy_vegetable',
        'created_at',
      ];

      const csvRows = [
        headers.join(','),
        ...foods.map(food =>
          [
            food.id,
            `"${food.name}"`,
            `"${food.category}"`,
            food.calories_per_100g,
            food.protein_per_100g,
            food.carbs_per_100g,
            food.fat_per_100g,
            food.fiber_per_100g || '',
            food.sugar_per_100g || '',
            food.sodium_per_100g || '',
            food.is_starchy_vegetable || false,
            food.created_at,
          ].join(',')
        ),
      ];

      return csvRows.join('\n');
    }
  }
}
