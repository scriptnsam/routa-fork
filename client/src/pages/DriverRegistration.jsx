import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DriverRegistration = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleType: 'BIKE',
    vehiclePlate: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.vehiclePlate || !formData.licenseNumber) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Demo: Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Driver profile created successfully! (Demo)');
      navigate('/driver/dashboard');
    }, 1500);
  };

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
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Complete Your Driver Profile</h1>
            <p className="text-gray-600 mt-2">
              Just a few more details to start earning with Routa
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'BIKE', label: 'Bike', icon: '🏍️' },
                  { value: 'CAR', label: 'Car', icon: '🚗' },
                  { value: 'VAN', label: 'Van', icon: '🚐' },
                  { value: 'TRUCK', label: 'Truck', icon: '🚚' },
                ].map((vehicle) => (
                  <label
                    key={vehicle.value}
                    className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.vehicleType === vehicle.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={vehicle.value}
                      checked={formData.vehicleType === vehicle.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <span className="text-3xl block mb-1">{vehicle.icon}</span>
                      <span className="font-medium text-gray-800">{vehicle.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Vehicle Plate */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Vehicle Plate Number
              </label>
              <input
                type="text"
                name="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 uppercase"
                placeholder="ABC-123-XY"
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Driver's License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 uppercase"
                placeholder="DL123456789"
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                By submitting, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Driver Guidelines</a>.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DriverRegistration;