const AdminUsers = () => {
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
            {[
              { name: 'Prashiksha Shrestha', email: 'p@nexl.com', role: 'Student', status: 'Active', date: 'Oct 12, 2025' },
              { name: 'Mr. Ram', email: 'ram@nexl.com', role: 'Instructor', status: 'Active', date: 'Sep 08, 2025' },
              { name: 'Siddhant Dhungel', email: 'sid@nexl.com', role: 'Student', status: 'Pending', date: 'Nov 02, 2025' },
            ].map((user) => (
              <tr key={user.email} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted-foreground hover:text-foreground font-bold px-2">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
