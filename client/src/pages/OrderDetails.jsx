import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RouteMap from '../components/Map/RouteMap';
import LiveTrackingMap from '../components/Map/LiveTrackingMap';

const OrderDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Simulate driver movement (demo)
  useEffect(() => {
    if (!order || !['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(order.status)) return;

    // Simulate driver location for demo
    const interval = setInterval(() => {
      const pickup = { lat: order.pickupLat, lng: order.pickupLng };
      const dropoff = { lat: order.dropoffLat, lng: order.dropoffLng };

      // Random position between pickup and dropoff for demo
      const progress = Math.random();
      setDriverLocation({
        lat: pickup.lat + (dropoff.lat - pickup.lat) * progress,
        lng: pickup.lng + (dropoff.lng - pickup.lng) * progress,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.patch(`/orders/${id}/cancel`);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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

  const getStatusStep = (status) => {
    const steps = { PENDING: 1, ACCEPTED: 2, PICKED_UP: 3, IN_TRANSIT: 4, DELIVERED: 5 };
    return steps[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <Link to="/orders/my-orders" className="text-blue-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const pickup = { lat: order.pickupLat, lng: order.pickupLng, address: order.pickupAddress };
  const dropoff = { lat: order.dropoffLat, lng: order.dropoffLng, address: order.dropoffAddress };
  const isLiveTracking = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Routa</Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/orders/my-orders"
          className="inline-flex items-center text-blue-600 hover:underline mb-4"
        >
          ← Back to My Orders
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
              <p className="text-gray-500 text-sm">ID: {order.id.slice(0, 8)}...</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {/* Progress Tracker */}
          {order.status !== 'CANCELLED' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index + 1 <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1 <= currentStep ? '✓' : index + 1}
                    </div>
                    <p className="text-xs mt-1 text-gray-600 hidden sm:block">{step}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Map */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {isLiveTracking ? '📍 Live Tracking' : '🗺️ Route Map'}
            </h3>
            {isLiveTracking ? (
              <LiveTrackingMap
                pickup={pickup}
                dropoff={dropoff}
                driverLocation={driverLocation}
                status={order.status}
              />
            ) : (
              <RouteMap pickup={pickup} dropoff={dropoff} />
            )}
          </div>

          {/* Price & Distance */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Price</p>
              <p className="text-2xl font-bold text-blue-600">₦{order.price.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Distance</p>
              <p className="text-2xl font-bold text-green-600">{order.distance} km</p>
            </div>
          </div>

          {/* Locations */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">📍 Pickup Location</p>
              <p className="font-medium text-gray-800 text-sm">{order.pickupAddress}</p>
              <p className="text-sm text-blue-600 mt-1">📞 {order.pickupContact}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">📦 Dropoff Location</p>
              <p className="font-medium text-gray-800 text-sm">{order.dropoffAddress}</p>
              <p className="text-sm text-blue-600 mt-1">📞 {order.dropoffContact}</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">🎁 Package</p>
            <p className="font-medium text-gray-800">{order.packageDesc}</p>
            {order.packageWeight && (
              <p className="text-sm text-gray-600">Weight: {order.packageWeight} kg</p>
            )}
          </div>

          {/* Driver Info */}
          {order.driver && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">🚗 Driver</p>
              <p className="font-medium text-gray-800">
                {order.driver.user.firstName} {order.driver.user.lastName}
              </p>
              <p className="text-sm text-blue-600">📞 {order.driver.user.phone}</p>
              <p className="text-sm text-gray-600">
                Vehicle: {order.driver.vehicleType} - {order.driver.vehiclePlate}
              </p>
              {order.driver.rating > 0 && (
                <p className="text-sm text-yellow-600">⭐ {order.driver.rating.toFixed(1)}</p>
              )}
            </div>
          )}

          {/* Cancel Button */}
          {['PENDING', 'ACCEPTED'].includes(order.status) && (
            <button
              onClick={handleCancel}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;