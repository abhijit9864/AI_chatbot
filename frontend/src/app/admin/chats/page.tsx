import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

const chats = [
  {
    id: "CHAT001",
    title: "Learn Java",
    user: "Abhijit Pradhan",
    messages: 24,
    updated: "Today, 10:32 AM",
  },
  {
    id: "CHAT002",
    title: "React Project Help",
    user: "Rahul Kumar",
    messages: 18,
    updated: "Today, 09:15 AM",
  },
  {
    id: "CHAT003",
    title: "Machine Learning Basics",
    user: "Priya Singh",
    messages: 31,
    updated: "Yesterday, 06:42 PM",
  },
];

export default function AdminChatsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Conversations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View conversations created by users.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 font-medium text-gray-500">
                        Conversation
                      </th>

                      <th className="px-5 py-4 font-medium text-gray-500">
                        User
                      </th>

                      <th className="px-5 py-4 font-medium text-gray-500">
                        Messages
                      </th>

                      <th className="px-5 py-4 font-medium text-gray-500">
                        Last Updated
                      </th>

                      <th className="px-5 py-4 text-right font-medium text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {chats.map((chat) => (
                      <tr
                        key={chat.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {chat.title}
                            </p>

                            <p className="text-xs text-gray-400">
                              {chat.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {chat.user}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {chat.messages}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {chat.updated}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            View
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