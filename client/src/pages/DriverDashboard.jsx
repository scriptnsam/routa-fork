import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  // Demo data
  const [driverStats] = useState({
    totalDeliveries: 0,
    rating: 0,
    earnings: 0,
    vehicleType: 'BIKE',
    vehiclePlate: 'ABC-123-XY',
  });

  const [availableOrders] = useState([
    // Demo orders - will come from API
  ]);

  const [myOrders] = useState([]);
  const [orderHistory] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const acceptOrder = (orderId) => {
    alert(`Order ${orderId} accepted! (Demo)`);
  };

  const updateOrderStatus = (orderId, status) => {
    alert(`Order ${orderId} updated to ${status}! (Demo)`);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">Routa Driver</Link>
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
        {/* Online Status Toggle */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Availability Status</h2>
              <p className="text-gray-600">
                {isOnline
                  ? '🟢 You are online and receiving orders'
                  : '🔴 You are offline'}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              className={`px-8 py-4 rounded-full font-bold text-white transition transform hover:scale-105 ${
                isOnline
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Vehicle</p>
            <p className="text-xl font-bold text-blue-600">{driverStats.vehicleType}</p>
            <p className="text-gray-400 text-xs">{driverStats.vehiclePlate}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Total Deliveries</p>
            <p className="text-2xl font-bold text-green-600">{driverStats.totalDeliveries}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Rating</p>
            <p className="text-2xl font-bold text-yellow-600">
              ⭐ {driverStats.rating > 0 ? driverStats.rating.toFixed(1) : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold text-purple-600">₦{driverStats.earnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Orders Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === 'available'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Available Orders ({availableOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === 'active'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              My Active Orders ({myOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              History
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Available Orders */}
            {activeTab === 'available' && (
              <div>
                {!isOnline ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">😴</span>
                    <p className="text-gray-500 mb-4">Go online to see available orders</p>
                    <button
                      onClick={toggleOnline}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Go Online
                    </button>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <p className="text-gray-500">No orders available at the moment</p>
                    <p className="text-gray-400 text-sm mt-2">New orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-lg font-bold text-blue-600">
                              ₦{order.price?.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                              • {order.distance} km
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <span className="text-green-500">📍</span>
                            <div>
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-gray-800">{order.pickupAddress}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500">📦</span>
                            <div>
                              <p className="text-xs text-gray-500">Dropoff</p>
                              <p className="text-gray-800">{order.dropoffAddress}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
                        >
                          Accept Order
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Orders */}
            {activeTab === 'active' && (
              <div>
                {myOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📭</span>
                    <p className="text-gray-500">No active orders</p>
                    <p className="text-gray-400 text-sm mt-2">Accept an order to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            ₦{order.price?.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <span className="text-green-500">📍</span>
                            <div>
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-gray-800">{order.pickupAddress}</p>
                              <p className="text-blue-600 text-sm">📞 {order.pickupContact}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500">📦</span>
                            <div>
                              <p className="text-xs text-gray-500">Dropoff</p>
                              <p className="text-gray-800">{order.dropoffAddress}</p>
                              <p className="text-blue-600 text-sm">📞 {order.dropoffContact}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-xs text-gray-500">Package</p>
                          <p className="text-gray-800">{order.packageDesc}</p>
                        </div>

                        {/* Status Update Buttons */}
                        {order.status === 'ACCEPTED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
                          >
                            Mark as Picked Up
                          </button>
                        )}
                        {order.status === 'PICKED_UP' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'IN_TRANSIT')}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            Start Delivery
                          </button>
                        )}
                        {order.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order History */}
            {activeTab === 'history' && (
              <div>
                {orderHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📜</span>
                    <p className="text-gray-500">No delivery history yet</p>
                    <p className="text-gray-400 text-sm mt-2">Completed orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-gray-800 mt-2">{order.dropoffAddress}</p>
                            <p className="text-gray-500 text-sm">
                              {new Date(order.deliveredAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            ₦{order.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;