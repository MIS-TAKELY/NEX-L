const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '1,284', change: '+12%', color: 'primary' },
    { label: 'Active Courses', value: '42', change: '+5%', color: 'accent' },
    { label: 'Total Revenue', value: 'Rs. 4.2M', change: '+18%', color: 'primary-light' },
    { label: 'Completion Rate', value: '76%', change: '+2%', color: 'accent-soft' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening across NEXL today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background p-6 rounded-md shadow-sm border border-border">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'accent' ? 'bg-accent/10 text-accent' :
                stat.color === 'primary-light' ? 'bg-primary-light/10 text-primary-light' :
                'bg-accent-soft text-accent'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background p-8 rounded-md border border-border shadow-sm h-80 flex items-center justify-center text-muted-foreground">
          User Growth Chart Placeholder
        </div>
        <div className="bg-background p-8 rounded-md border border-border shadow-sm h-80 flex items-center justify-center text-muted-foreground">
          Revenue Distribution Placeholder
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
