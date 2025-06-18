'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Apple,
  ChefHat,
} from 'lucide-react';

interface AnalyticsData {
  totalFoods: number;
  totalRecipes: number;
  totalMealPlans: number;
  activePlans: number;
  foodsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recipesByDifficulty: Array<{
    difficulty: string;
    count: number;
    percentage: number;
  }>;
  mealPlansByType: Array<{ type: string; count: number; percentage: number }>;
  recentTrends: {
    foodsAdded: number;
    recipesAdded: number;
    plansCreated: number;
    periodsComparison: string;
  };
}

export function NutritionAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Simulated analytics data - replace with actual API call
      const analyticsData: AnalyticsData = {
        totalFoods: 245,
        totalRecipes: 67,
        totalMealPlans: 12,
        activePlans: 8,
        foodsByCategory: [
          { category: 'Vegetables', count: 85, percentage: 35 },
          { category: 'Meat & Poultry', count: 42, percentage: 17 },
          { category: 'Fruits', count: 38, percentage: 15 },
          { category: 'Whole Grains', count: 28, percentage: 11 },
          { category: 'Legumes', count: 22, percentage: 9 },
          { category: 'Nuts & Seeds', count: 18, percentage: 7 },
          { category: 'Plant Oils', count: 8, percentage: 3 },
          { category: 'Eggs', count: 4, percentage: 2 },
        ],
        recipesByDifficulty: [
          { difficulty: 'Easy', count: 32, percentage: 48 },
          { difficulty: 'Medium', count: 25, percentage: 37 },
          { difficulty: 'Hard', count: 10, percentage: 15 },
        ],
        mealPlansByType: [
          { type: 'Maintaining', count: 6, percentage: 50 },
          { type: 'Cutting', count: 4, percentage: 33 },
          { type: 'Bulking', count: 2, percentage: 17 },
        ],
        recentTrends: {
          foodsAdded: 12,
          recipesAdded: 5,
          plansCreated: 2,
          periodsComparison: 'last 30 days vs previous 30 days',
        },
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load analytics data. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Nutrition Analytics</h2>
        <p className="text-muted-foreground">
          Insights and statistics about your nutrition database
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Foods</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFoods}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentTrends.foodsAdded} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRecipes}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentTrends.recipesAdded} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meal Plan Templates
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMealPlans}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentTrends.plansCreated} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.activePlans / data.totalMealPlans) * 100)}%
              utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Food Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.foodsByCategory.map(category => (
                <div
                  key={category.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">
                      {category.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {category.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recipesByDifficulty.map(difficulty => {
                const color =
                  difficulty.difficulty === 'Easy'
                    ? 'bg-green-500'
                    : difficulty.difficulty === 'Medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500';

                return (
                  <div
                    key={difficulty.difficulty}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 ${color} rounded-full`}></div>
                      <span className="text-sm font-medium">
                        {difficulty.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${difficulty.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {difficulty.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meal Plan Types and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Plan Types */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Plan Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.mealPlansByType.map(planType => {
                const icon =
                  planType.type === 'Cutting' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : planType.type === 'Bulking' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                  );

                const color =
                  planType.type === 'Cutting'
                    ? 'bg-red-500'
                    : planType.type === 'Bulking'
                      ? 'bg-green-500'
                      : 'bg-blue-500';

                return (
                  <div
                    key={planType.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {icon}
                      <span className="text-sm font-medium">
                        {planType.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${planType.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {planType.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Trends for {data.recentTrends.periodsComparison}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Apple className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Foods Added</div>
                    <div className="text-sm text-muted-foreground">
                      New items in database
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  +{data.recentTrends.foodsAdded}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Recipes Created</div>
                    <div className="text-sm text-muted-foreground">
                      New recipe additions
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  +{data.recentTrends.recipesAdded}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Plans Created</div>
                    <div className="text-sm text-muted-foreground">
                      New meal plan templates
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  +{data.recentTrends.plansCreated}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">
                Most Popular Category
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {data.foodsByCategory[0].category} with{' '}
                {data.foodsByCategory[0].count} foods
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">
                Recipe Preference
              </div>
              <div className="text-sm text-green-700 mt-1">
                {data.recipesByDifficulty[0].percentage}% of recipes are{' '}
                {data.recipesByDifficulty[0].difficulty.toLowerCase()}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-900">
                Plan Utilization
              </div>
              <div className="text-sm text-purple-700 mt-1">
                {Math.round((data.activePlans / data.totalMealPlans) * 100)}% of
                templates are in use
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
