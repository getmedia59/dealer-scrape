import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Vehicle Marketplace Scraping Service
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A modern web scraping service for collecting vehicle inventory data from dealer websites.
          Simplify your data collection process and focus on growing your marketplace.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/auth/login"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-gray-50"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 