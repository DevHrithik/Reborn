import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NutritionPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Nutrition Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage food database, meal plans, and recipes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Nutrition management features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
