import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Routa</Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hello, {user?.firstName}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-blue-100">Ready to send a package? We've got you covered.</p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/orders/create"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Send a Package</h3>
            <p className="text-gray-600">Create a new delivery order</p>
          </Link>

          <Link
            to="/orders/my-orders"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">My Orders</h3>
            <p className="text-gray-600">View and track your deliveries</p>
          </Link>

          <Link
            to="/orders/my-orders"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <span className="text-3xl">📍</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Track Order</h3>
            <p className="text-gray-600">Real-time delivery tracking</p>
          </Link>
        </div>

        {/* Stats */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-blue-600">₦0</p>
          </div>
        </div>

        {/* Recent Orders */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link
              to="/orders/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Order
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;