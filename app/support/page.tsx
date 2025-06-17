import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-1">
          Manage support tickets and customer inquiries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Support management features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
