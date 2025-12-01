import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Demo orders
  const [orders] = useState([
    { id: '1', customer: 'John Doe', customerPhone: '08012345678', driver: 'Mike Smith', driverPhone: '08034567890', pickupAddress: '123 Main St, Lagos', dropoffAddress: '456 Park Ave, Lagos', status: 'DELIVERED', price: 1500, distance: 5.2, createdAt: '2024-01-15' },
    { id: '2', customer: 'Jane Wilson', customerPhone: '08023456789', driver: 'David Lee', driverPhone: '08056789012', pickupAddress: '789 Oak Rd, Lagos', dropoffAddress: '321 Elm St, Lagos', status: 'IN_TRANSIT', price: 2200, distance: 8.5, createdAt: '2024-01-15' },
    { id: '3', customer: 'Bob Johnson', customerPhone: '08045678901', driver: null, driverPhone: null, pickupAddress: '555 Pine Ln, Lagos', dropoffAddress: '777 Cedar Dr, Lagos', status: 'PENDING', price: 1800, distance: 6.3, createdAt: '2024-01-15' },
    { id: '4', customer: 'Alice Davis', customerPhone: '08056789012', driver: 'Chris Brown', driverPhone: '08067890123', pickupAddress: '999 Maple Ave, Lagos', dropoffAddress: '111 Birch Blvd, Lagos', status: 'PICKED_UP', price: 3500, distance: 12.1, createdAt: '2024-01-14' },
    { id: '5', customer: 'Tom Harris', customerPhone: '08067890123', driver: null, driverPhone: null, pickupAddress: '222 Walnut St, Lagos', dropoffAddress: '444 Spruce Ct, Lagos', status: 'CANCELLED', price: 1200, distance: 4.0, createdAt: '2024-01-14' },
  ]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm) ||
      order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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

  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.driver ? (
                        <>
                          <p className="text-sm text-gray-900">{order.driver}</p>
                          <p className="text-xs text-gray-500">{order.driverPhone}</p>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-[200px]">
                        📍 {order.pickupAddress}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        📦 {order.dropoffAddress}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">₦{order.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.distance} km</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.id}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Price & Distance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Price</p>
                    <p className="text-2xl font-bold text-blue-600">₦{selectedOrder.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Distance</p>
                    <p className="text-2xl font-bold text-green-600">{selectedOrder.distance} km</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">👤 Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                  <p className="text-sm text-blue-600">{selectedOrder.customerPhone}</p>
                </div>

                {/* Driver */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">🚗 Driver</p>
                  {selectedOrder.driver ? (
                    <>
                      <p className="font-medium">{selectedOrder.driver}</p>
                      <p className="text-sm text-blue-600">{selectedOrder.driverPhone}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">Not assigned yet</p>
                  )}
                </div>

                {/* Locations */}
                <div className="space-y-2">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">📍 Pickup</p>
                    <p className="font-medium">{selectedOrder.pickupAddress}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">📦 Dropoff</p>
                    <p className="font-medium">{selectedOrder.dropoffAddress}</p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500 text-center">
                  Created: {selectedOrder.createdAt}
                </p>
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;