import SupportDashboard from '@/components/support/support-dashboard';

export default function SupportPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-1">
          Manage support tickets and customer inquiries.
        </p>
      </div>

      <SupportDashboard />
    </div>
  );
}
