import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocationPicker from '../components/Map/LocationPicker';
import RouteMap from '../components/Map/RouteMap';

const CreateOrder = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [formData, setFormData] = useState({
    pickupContact: '',
    dropoffContact: '',
    packageDesc: '',
    packageWeight: '',
  });

  const [priceEstimate, setPriceEstimate] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const calculatePrice = () => {
    if (!pickup || !dropoff) return;

    const R = 6371;
    const dLat = (dropoff.lat - pickup.lat) * (Math.PI / 180);
    const dLng = (dropoff.lng - pickup.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickup.lat * (Math.PI / 180)) *
      Math.cos(dropoff.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c * 10) / 10;

    const basePrice = 500;
    const pricePerKm = 100;
    const price = basePrice + (distance * pricePerKm);

    setPriceEstimate({ distance, price: Math.round(price) });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!pickup || !formData.pickupContact) {
        setError('Please select pickup location and enter contact');
        return;
      }
    } else if (step === 2) {
      if (!dropoff || !formData.dropoffContact) {
        setError('Please select dropoff location and enter contact');
        return;
      }
      calculatePrice();
    }
    setStep(step + 1);
    setError('');
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.packageDesc) {
      setError('Please describe your package');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupContact: formData.pickupContact,
        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffContact: formData.dropoffContact,
        packageDesc: formData.packageDesc,
        packageWeight: formData.packageWeight ? parseFloat(formData.packageWeight) : null,
      };

      const response = await api.post('/orders', orderData);
      navigate(`/orders/${response.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Delivery Order</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-700">
              {step === 1 && '📍 Select Pickup Location'}
              {step === 2 && '📦 Select Dropoff Location'}
              {step === 3 && '✅ Confirm Order'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Pickup */}
            {step === 1 && (
              <div className="space-y-4">
                <LocationPicker
                  label="📍 Pickup Location"
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Search pickup address..."
                  markerColor="#22C55E"
                />

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Pickup Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="pickupContact"
                    value={formData.pickupContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="08012345678"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Next: Dropoff Location →
                </button>
              </div>
            )}

            {/* Step 2: Dropoff */}
            {step === 2 && (
              <div className="space-y-4">
                <LocationPicker
                  label="📦 Dropoff Location"
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="Search dropoff address..."
                  markerColor="#EF4444"
                />

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Dropoff Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="dropoffContact"
                    value={formData.dropoffContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="08012345678"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Next: Confirm →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Route Map */}
                {pickup && dropoff && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Route Preview</h3>
                    <RouteMap pickup={pickup} dropoff={dropoff} />
                  </div>
                )}

                {/* Price Estimate */}
                {priceEstimate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-gray-600 text-sm">Distance</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {priceEstimate.distance} km
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Estimated Price</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₦{priceEstimate.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">📍 Pickup</p>
                    <p className="font-medium text-gray-800 text-sm">{pickup?.address}</p>
                    <p className="text-sm text-blue-600 mt-1">{formData.pickupContact}</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">📦 Dropoff</p>
                    <p className="font-medium text-gray-800 text-sm">{dropoff?.address}</p>
                    <p className="text-sm text-blue-600 mt-1">{formData.dropoffContact}</p>
                  </div>
                </div>

                {/* Package Details */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Package Description
                  </label>
                  <textarea
                    name="packageDesc"
                    value={formData.packageDesc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="What are you sending? (e.g., Documents, Electronics, Food)"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    name="packageWeight"
                    value={formData.packageWeight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Approximate weight"
                    step="0.1"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
                  >
                    {loading ? 'Creating Order...' : 'Confirm Order ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateOrder;