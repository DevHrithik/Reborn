import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage admin panel settings and configurations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Settings features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
