import { CommunityDashboard } from '@/components/community/community-dashboard';

export default function CommunityPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Community Moderation
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and moderate community posts and user interactions.
        </p>
      </div>

      <CommunityDashboard />
    </div>
  );
}
