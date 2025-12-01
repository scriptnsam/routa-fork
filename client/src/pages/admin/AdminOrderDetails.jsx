import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import RouteMap from '../../components/Map/RouteMap';
import api from '../../services/api';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
        </div>
      </AdminLayout>
    );
  }

  const pickup = { lat: order.pickupLat, lng: order.pickupLng };
  const dropoff = { lat: order.dropoffLat, lng: order.dropoffLng };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-blue-600 hover:underline mb-2"
            >
              ← Back to Orders
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Order Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Order ID</p>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Created</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Price</p>
                  <p className="font-medium text-blue-600">
                    ₦{order.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Distance</p>
                  <p className="font-medium">{order.distance} km</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Customer</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {order.customer.firstName[0]}
                    {order.customer.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">{order.customer.email}</p>
                  <p className="text-gray-500 text-sm">{order.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            {order.driver && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4">Driver</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">
                      {order.driver.user.firstName[0]}
                      {order.driver.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {order.driver.user.firstName} {order.driver.user.lastName}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {order.driver.user.email}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {order.driver.user.phone}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {order.driver.vehicleType} - {order.driver.vehiclePlate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Locations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Locations</h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">📍 Pickup</p>
                  <p className="font-medium">{order.pickupAddress}</p>
                  <p className="text-sm text-blue-600">{order.pickupContact}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">📦 Dropoff</p>
                  <p className="font-medium">{order.dropoffAddress}</p>
                  <p className="text-sm text-blue-600">{order.dropoffContact}</p>
                </div>
              </div>
            </div>

            {/* Package */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Package</h2>
              <p className="text-gray-800">{order.packageDesc}</p>
              {order.packageWeight && (
                <p className="text-gray-500 text-sm mt-2">
                  Weight: {order.packageWeight} kg
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Route Map</h2>
              <RouteMap pickup={pickup} dropoff={dropoff} />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.pickedUpAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      📦
                    </div>
                    <div>
                      <p className="font-medium">Picked Up</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.pickedUpAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✅
                    </div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetails;