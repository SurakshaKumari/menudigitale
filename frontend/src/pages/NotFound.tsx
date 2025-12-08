import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Frown } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Frown className="h-16 w-16 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">404</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. 
          It might have been moved, deleted, or perhaps never existed.
        </p>

        {/* Search Box */}
        <div className="mb-10">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search for menus, restaurants, or features..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link
            to="/"
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Go Home</h3>
            <p className="text-sm text-gray-600">Return to the dashboard</p>
          </Link>

          <Link
            to="/menus"
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 group-hover:bg-green-200 transition-colors">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Browse Menus</h3>
            <p className="text-sm text-gray-600">Explore all available menus</p>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200 transition-colors">
              <ArrowLeft className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Go Back</h3>
            <p className="text-sm text-gray-600">Return to previous page</p>
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you believe this page should exist, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@menudigitale.com"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/docs"
              className="bg-white border border-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Documentation
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Still lost? Check out our{' '}
            <Link to="/sitemap" className="text-blue-600 hover:text-blue-700 font-medium">
              sitemap
            </Link>
            {' '}or{' '}
            <Link to="/help" className="text-blue-600 hover:text-blue-700 font-medium">
              help center
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;