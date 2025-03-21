import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Car, Calendar, Settings, LogOut, Truck } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-semibold">Vehicle Scraper</span>
          </div>
          <div className="flex flex-col flex-grow px-4 mt-5">
            <nav className="flex-1 space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/dealers"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <Car className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Dealers
              </Link>
              <Link
                href="/dashboard/vehicles"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <Truck className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Vehicles
              </Link>
              <Link
                href="/dashboard/scrapers"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <Users className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Scrapers
              </Link>
              <Link
                href="/dashboard/jobs"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <Calendar className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Jobs
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Settings
              </Link>
            </nav>

            <div className="mt-auto">
              <Link
                href="/auth/logout"
                className="flex items-center px-2 py-2 mt-5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="w-full">
          <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-0">
              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center md:ml-6 md:pr-6">
                <div className="relative">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-700">Administrator</div>
                      <div className="text-xs text-gray-500">admin@example.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 