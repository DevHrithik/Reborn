import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkoutsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Workout Management</h1>
        <p className="text-gray-600 mt-1">
          Create and manage workout plans, exercises, and equipment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workouts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Workout management features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
