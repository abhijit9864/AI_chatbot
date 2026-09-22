import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

const users = [
  {
    id: "USR001",
    name: "Abhijit Pradhan",
    email: "abhijit@example.com",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: "USR002",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    role: "USER",
    status: "Active",
  },
  {
    id: "USR003",
    name: "Priya Singh",
    email: "priya@example.com",
    role: "USER",
    status: "Disabled",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Users
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage registered users and their access.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 font-medium text-gray-500">
                        User
                      </th>

                      <th className="px-5 py-4 font-medium text-gray-500">
                        Role
                      </th>

                      <th className="px-5 py-4 font-medium text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-medium text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}