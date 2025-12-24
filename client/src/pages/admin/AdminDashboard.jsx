import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Phone,
  Mail,
  Shield,
  Activity
} from 'lucide-react';

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'drivers', label: 'Drivers', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 transform transition-transform duration-300
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Logo.png" alt="Routa" className="w-8 h-8" />
            <span className="text-xl font-bold text-white">Routa</span>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Admin</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
                ${activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Admin User</p>
              <p className="text-gray-400 text-xs">admin@routa.com</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-xl transition">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}% from last week</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// Dashboard Overview
const DashboardOverview = () => {
  const stats = [
    { title: 'Total Orders', value: '1,234', change: 12, changeType: 'up', icon: Package, color: 'bg-blue-500' },
    { title: 'Active Drivers', value: '56', change: 8, changeType: 'up', icon: Truck, color: 'bg-green-500' },
    { title: 'Total Customers', value: '892', change: 15, changeType: 'up', icon: Users, color: 'bg-purple-500' },
    { title: 'Revenue', value: '₦2.4M', change: 5, changeType: 'down', icon: DollarSign, color: 'bg-yellow-500' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', driver: 'Tunde A.', status: 'delivered', amount: 1500, time: '10 mins ago' },
    { id: 'ORD-002', customer: 'Mary Jane', driver: 'Chidi O.', status: 'in_transit', amount: 2000, time: '25 mins ago' },
    { id: 'ORD-003', customer: 'Peter Pan', driver: 'Bola K.', status: 'pending', amount: 1200, time: '1 hour ago' },
    { id: 'ORD-004', customer: 'Jane Smith', driver: 'Emeka N.', status: 'cancelled', amount: 1800, time: '2 hours ago' },
    { id: 'ORD-005', customer: 'David Brown', driver: 'Funmi A.', status: 'delivered', amount: 2500, time: '3 hours ago' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-700',
      in_transit: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      delivered: 'Delivered',
      in_transit: 'In Transit',
      pending: 'Pending',
      cancelled: 'Cancelled',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Orders Overview</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          {/* Placeholder Chart */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-blue-300 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integrate with Chart.js or Recharts</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Revenue</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          {/* Placeholder Chart */}
          <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart</p>
              <p className="text-sm text-gray-400">Integrate with Chart.js or Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link to="#" className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.driver}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.time}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Drivers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Top Drivers</h3>
          <div className="space-y-4">
            {[
              { name: 'Tunde Adeyemi', trips: 156, rating: 4.9, earnings: '₦85,000' },
              { name: 'Chidi Okonkwo', trips: 142, rating: 4.8, earnings: '₦78,000' },
              { name: 'Funmi Ajayi', trips: 128, rating: 4.9, earnings: '₦72,000' },
            ].map((driver, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{driver.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{driver.trips} trips</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {driver.rating}
                    </div>
                  </div>
                </div>
                <span className="text-green-600 font-medium">{driver.earnings}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: UserPlus, text: 'New driver registered', time: '2 mins ago', color: 'bg-green-100 text-green-600' },
              { icon: Package, text: 'Order #ORD-001 delivered', time: '10 mins ago', color: 'bg-blue-100 text-blue-600' },
              { icon: AlertCircle, text: 'Order #ORD-004 cancelled', time: '1 hour ago', color: 'bg-red-100 text-red-600' },
              { icon: DollarSign, text: 'Payment received ₦5,000', time: '2 hours ago', color: 'bg-yellow-100 text-yellow-600' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition">
              <UserPlus className="w-5 h-5" />
              <span>Add New Driver</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition">
              <Download className="w-5 h-5" />
              <span>Export Reports</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition">
              <Bell className="w-5 h-5" />
              <span>Send Notification</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition">
              <Settings className="w-5 h-5" />
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Orders Management
const OrdersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    { id: 'ORD-001', customer: 'John Doe', phone: '+234 801 234 5678', driver: 'Tunde A.', pickup: '123 Victoria Island', dropoff: '45 Ikeja GRA', status: 'delivered', amount: 1500, date: '2024-01-15', time: '10:30 AM' },
    { id: 'ORD-002', customer: 'Mary Jane', phone: '+234 802 345 6789', driver: 'Chidi O.', pickup: '78 Lekki Phase 1', dropoff: '12 Surulere', status: 'in_transit', amount: 2000, date: '2024-01-15', time: '11:45 AM' },
    { id: 'ORD-003', customer: 'Peter Pan', phone: '+234 803 456 7890', driver: 'Pending', pickup: '56 Yaba', dropoff: '34 Ajah', status: 'pending', amount: 1200, date: '2024-01-15', time: '12:15 PM' },
    { id: 'ORD-004', customer: 'Jane Smith', phone: '+234 804 567 8901', driver: 'Emeka N.', pickup: '90 Ikoyi', dropoff: '23 Maryland', status: 'cancelled', amount: 1800, date: '2024-01-15', time: '09:00 AM' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-700',
      in_transit: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500">Manage all delivery orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.driver}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{order.pickup}</p>
                      <p className="text-gray-500">→ {order.dropoff}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">₦{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing 1-10 of 100 orders</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Drivers Management
const DriversManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const drivers = [
    { id: 1, name: 'Tunde Adeyemi', phone: '+234 801 234 5678', email: 'tunde@email.com', vehicle: 'Honda Ace 125', plate: 'EKT-234-AB', status: 'online', trips: 156, rating: 4.9, earnings: 85000, verified: true },
    { id: 2, name: 'Chidi Okonkwo', phone: '+234 802 345 6789', email: 'chidi@email.com', vehicle: 'Bajaj Boxer', plate: 'EKT-567-CD', status: 'offline', trips: 142, rating: 4.8, earnings: 78000, verified: true },
    { id: 3, name: 'Funmi Ajayi', phone: '+234 803 456 7890', email: 'funmi@email.com', vehicle: 'TVS Apache', plate: 'EKT-890-EF', status: 'busy', trips: 128, rating: 4.9, earnings: 72000, verified: true },
    { id: 4, name: 'Emeka Nwosu', phone: '+234 804 567 8901', email: 'emeka@email.com', vehicle: 'Honda CG', plate: 'EKT-123-GH', status: 'online', trips: 98, rating: 4.7, earnings: 52000, verified: false },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      online: 'bg-green-100 text-green-700',
      offline: 'bg-gray-100 text-gray-700',
      busy: 'bg-yellow-100 text-yellow-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
          <p className="text-gray-500">Manage your delivery riders</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900">56</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Online Now</p>
          <p className="text-2xl font-bold text-green-600">23</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">On Delivery</p>
          <p className="text-2xl font-bold text-yellow-600">12</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Pending Verification</p>
          <p className="text-2xl font-bold text-red-600">5</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      {/* Drivers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{driver.name}</p>
                    {driver.verified && (
                      <Shield className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(driver.status)}`}>
                    {driver.status}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {driver.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-4 h-4" />
                {driver.vehicle} • {driver.plate}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{driver.trips}</p>
                <p className="text-xs text-gray-500">Trips</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-lg font-bold text-gray-900">{driver.rating}</p>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">₦{(driver.earnings / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">Earned</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                View Profile
              </button>
              <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Customers Management
const CustomersManagement = () => {
  const customers = [
    { id: 1, name: 'John Doe', phone: '+234 801 234 5678', email: 'john@email.com', orders: 25, spent: 45000, joined: 'Jan 2024' },
    { id: 2, name: 'Mary Jane', phone: '+234 802 345 6789', email: 'mary@email.com', orders: 18, spent: 32000, joined: 'Feb 2024' },
    { id: 3, name: 'Peter Pan', phone: '+234 803 456 7890', email: 'peter@email.com', orders: 12, spent: 21000, joined: 'Mar 2024' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">Manage your customer base</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{customer.phone}</p>
                      <p className="text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{customer.orders}</td>
                  <td className="px-6 py-4 font-medium text-green-600">₦{customer.spent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{customer.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Settings Page
const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your application settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="Routa"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                defaultValue="routahq@gmail.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
              <input
                type="tel"
                defaultValue="+234 903 351 8016"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Pricing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₦)</label>
              <input
                type="number"
                defaultValue="500"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price per KM (₦)</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver Commission (%)</label>
              <input
                type="number"
                defaultValue="80"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <OrdersManagement />;
      case 'drivers':
        return <DriversManagement />;
      case 'customers':
        return <CustomersManagement />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                <p className="text-sm text-gray-500">Welcome back, Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;