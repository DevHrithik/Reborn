'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Apple,
  ChefHat,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react';
import { NutritionService, type NutritionStats } from '@/lib/data/nutrition';
import { FoodManagement } from '@/components/nutrition/food-management';
import { MealPlanTemplates } from '@/components/nutrition/meal-plan-templates';
import { RecipeManagement } from '@/components/nutrition/recipe-management';
import { NutritionAnalytics } from '@/components/nutrition/nutrition-analytics';

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await NutritionService.getNutritionStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load nutrition stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Nutrition Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage food database, meal plans, recipes, and nutrition analytics.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="foods" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Food Database
          </TabsTrigger>
          <TabsTrigger value="meal-plans" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Meal Plans
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Foods
                    </CardTitle>
                    <Apple className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalFoods}</div>
                    <p className="text-xs text-muted-foreground">
                      Across {stats.foodsByCategory.length} categories
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Meal Plan Templates
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalMealPlans}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cutting, maintaining & bulking
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recipes
                    </CardTitle>
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalRecipes}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      With instructions & nutrition
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active User Plans
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.activeMealPlans}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently in use by users
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Food Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Food Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.foodsByCategory.map(category => (
                      <Badge
                        key={category.category}
                        variant="secondary"
                        className="text-sm"
                      >
                        {category.category}: {category.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recently Added */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Foods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.recentlyAdded.foods.slice(0, 5).map(food => (
                      <div
                        key={food.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium">{food.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {food.category}
                        </Badge>
                      </div>
                    ))}
                    {stats.recentlyAdded.foods.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No foods added yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Recipes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.recentlyAdded.recipes.slice(0, 5).map(recipe => (
                      <div
                        key={recipe.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium">{recipe.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    ))}
                    {stats.recentlyAdded.recipes.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No recipes added yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Meal Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.recentlyAdded.mealPlans.slice(0, 5).map(plan => (
                      <div
                        key={plan.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium">{plan.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {plan.plan_type}
                        </Badge>
                      </div>
                    ))}
                    {stats.recentlyAdded.mealPlans.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No meal plans added yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setActiveTab('foods')}
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add Food
                    </Button>
                    <Button
                      onClick={() => setActiveTab('meal-plans')}
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Target className="h-5 w-5" />
                      Create Meal Plan
                    </Button>
                    <Button
                      onClick={() => setActiveTab('recipes')}
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <ChefHat className="h-5 w-5" />
                      Add Recipe
                    </Button>
                    <Button
                      onClick={() => setActiveTab('analytics')}
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <TrendingUp className="h-5 w-5" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Failed to load nutrition statistics. Please try refreshing the
                  page.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="foods">
          <FoodManagement onUpdate={refreshStats} />
        </TabsContent>

        <TabsContent value="meal-plans">
          <MealPlanTemplates onUpdate={refreshStats} />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeManagement onUpdate={refreshStats} />
        </TabsContent>

        <TabsContent value="analytics">
          <NutritionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
