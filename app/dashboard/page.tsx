import { Metadata } from "next";
import { Clock, Car, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Vehicle Marketplace Scraping Service",
  description: "Dashboard overview of your vehicle scraping activities",
};

export default function DashboardPage() {
  const stats = [
    {
      name: "Active Jobs",
      value: "5",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
    },
    {
      name: "Total Vehicles",
      value: "12,453",
      icon: <Car className="h-6 w-6 text-green-600" />,
    },
    {
      name: "Success Rate",
      value: "98.5%",
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
    },
    {
      name: "Failed Jobs",
      value: "2",
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
    },
  ];

  const recentJobs = [
    {
      id: "JOB-123",
      dealer: "ABC Motors",
      status: "Completed",
      vehicles: 243,
      date: "Today, 2:30 PM",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "JOB-122",
      dealer: "XYZ Autos",
      status: "Running",
      vehicles: 118,
      date: "Today, 1:15 PM",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "JOB-121",
      dealer: "City Cars",
      status: "Failed",
      vehicles: 0,
      date: "Today, 11:30 AM",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: "JOB-120",
      dealer: "Premier Vehicles",
      status: "Completed",
      vehicles: 187,
      date: "Yesterday, 4:45 PM",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "JOB-119",
      dealer: "Highway Motors",
      status: "Completed",
      vehicles: 95,
      date: "Yesterday, 2:15 PM",
      statusColor: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your vehicle scraping activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Jobs</h3>
          <div className="divide-y">
            {recentJobs.map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{job.dealer}</p>
                  <p className="text-xs text-gray-500">{job.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{job.vehicles} vehicles</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${job.statusColor}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <a
              href="/dashboard/jobs"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all jobs →
            </a>
          </div>
        </div>

        {/* Activity Chart (Placeholder) */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Vehicle Collection</h3>
          <div className="h-64 bg-gray-50 flex items-center justify-center border rounded">
            <p className="text-gray-500 text-sm">
              [Chart showing vehicle collection over time]
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <a
              href="/dashboard/analytics"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View detailed analytics →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 