import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
