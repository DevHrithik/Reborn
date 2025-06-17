import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Reports
        </h1>
        <p className="text-gray-600 mt-1">
          View detailed analytics and generate reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Analytics features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
