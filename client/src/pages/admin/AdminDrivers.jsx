import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Demo drivers
  const [drivers] = useState([
    { id: '1', firstName: 'Mike', lastName: 'Smith', email: 'mike@example.com', phone: '08034567890', vehicleType: 'BIKE', vehiclePlate: 'ABC-123', licenseNumber: 'DL001', isApproved: true, totalDeliveries: 45, rating: 4.8 },
    { id: '2', firstName: 'David', lastName: 'Lee', email: 'david@example.com', phone: '08056789012', vehicleType: 'CAR', vehiclePlate: 'XYZ-789', licenseNumber: 'DL002', isApproved: true, totalDeliveries: 32, rating: 4.5 },
    { id: '3', firstName: 'Chris', lastName: 'Brown', email: 'chris@example.com', phone: '08067890123', vehicleType: 'VAN', vehiclePlate: 'LMN-456', licenseNumber: 'DL003', isApproved: false, totalDeliveries: 0, rating: 0 },
    { id: '4', firstName: 'James', lastName: 'Wilson', email: 'james@example.com', phone: '08078901234', vehicleType: 'BIKE', vehiclePlate: 'PQR-321', licenseNumber: 'DL004', isApproved: false, totalDeliveries: 0, rating: 0 },
    { id: '5', firstName: 'Peter', lastName: 'Taylor', email: 'peter@example.com', phone: '08089012345', vehicleType: 'TRUCK', vehiclePlate: 'STU-654', licenseNumber: 'DL005', isApproved: true, totalDeliveries: 78, rating: 4.9 },
  ]);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'approved' && driver.isApproved) ||
      (statusFilter === 'pending' && !driver.isApproved);
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (driverId) => {
    alert(`Driver ${driverId} approved! (Demo)`);
  };

  const handleReject = (driverId) => {
    if (confirm('Are you sure you want to reject this driver?')) {
      alert(`Driver ${driverId} rejected! (Demo)`);
    }
  };

  const getVehicleIcon = (type) => {
    const icons = {
      BIKE: '🏍️',
      CAR: '🚗',
      VAN: '🚐',
      TRUCK: '🚚',
    };
    return icons[type] || '🚗';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-800">{drivers.length}</p>
              </div>
              <span className="text-4xl">🚗</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {drivers.filter((d) => d.isApproved).length}
                </p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">
                  {drivers.filter((d) => !d.isApproved).length}
                </p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search drivers..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {driver.firstName[0]}{driver.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{driver.licenseNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{driver.email}</p>
                      <p className="text-xs text-gray-500">{driver.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getVehicleIcon(driver.vehicleType)}</span>
                        <div>
                          <p className="text-sm text-gray-900">{driver.vehicleType}</p>
                          <p className="text-xs text-gray-500">{driver.vehiclePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{driver.totalDeliveries} deliveries</p>
                      <p className="text-xs text-yellow-600">
                        ⭐ {driver.rating > 0 ? driver.rating.toFixed(1) : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {driver.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.isApproved ? (
                        <button
                          onClick={() => handleReject(driver.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Revoke
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(driver.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(driver.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDrivers;