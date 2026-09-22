import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";
import StatCard from "@/components/admin/stat-card";

export default function AdminPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value="1,248"
                description="Registered accounts"
              />

              <StatCard
                title="Active Users"
                value="842"
                description="Recently active"
              />

              <StatCard
                title="Total Chats"
                value="8,521"
                description="All conversations"
              />

              <StatCard
                title="Messages"
                value="54,293"
                description="Total messages"
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900">
                  Recent Users
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  User activity will appear here.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900">
                  Recent Conversations
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Conversation activity will appear here.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}