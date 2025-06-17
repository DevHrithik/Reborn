import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage REBORN app users, their profiles, and activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            User management features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
