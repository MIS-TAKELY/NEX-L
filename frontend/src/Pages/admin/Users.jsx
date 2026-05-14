import { useGetAdminUsersQuery } from "@/store/slices/siteApi";

const AdminUsers = () => {
  const { data, isLoading } = useGetAdminUsersQuery({ limit: 50 });
  const users = data?.users || [];

  if (isLoading) {
    return <div className="text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
        </div>
        <button className="bg-primary text-foreground px-6 py-2.5 rounded-md font-bold hover:bg-primary-hover transition-all">
          Add New User
        </button>
      </div>

      <div className="bg-background rounded-md border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? users.map((user) => (
              <tr key={user._id || user.email} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{user.role || "student"}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.emailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {user.emailVerified ? "Active" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted-foreground hover:text-foreground font-bold px-2">Edit</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
