import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import {
  MapPin,
  Navigation,
  Package,
  FileText,
  UtensilsCrossed,
  ShoppingBag,
  Gift,
  Clock,
  Route,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Smartphone,
  Info,
  Shield,
  Zap,
  X,
  Check,
  Search,
  Loader,
  AlertCircle
} from 'lucide-react';
import socketService from '../services/socketService';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color, emoji, size = 36) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
      ">${emoji}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pickupIcon = createIcon('#22c55e', '📦');
const dropoffIcon = createIcon('#f97316', '📍');

// Map bounds fitter
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [points, map]);
  return null;
};

// Location Search Component
const LocationSearch = ({ 
  placeholder, 
  value, 
  onSelect, 
  icon: Icon,
  iconColor 
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value]);

  const searchLocations = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ng&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (suggestion) => {
    const location = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    setQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(location);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className={`w-10 h-10 ${iconColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          />
        </div>
        {isSearching && <Loader className="w-5 h-5 text-gray-400 animate-spin" />}
        {query && !isSearching && (
          <button 
            onClick={() => {
              setQuery('');
              onSelect(null);
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 line-clamp-2">{suggestion.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main CreateOrder Component
const CreateOrder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Location, 2: Details, 3: Confirm
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [packageType, setPackageType] = useState('package');
  const [packageDescription, setPackageDescription] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [priceOffer, setPriceOffer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Package types
  const packageTypes = [
    { id: 'document', label: 'Document', icon: FileText, emoji: '📄' },
    { id: 'package', label: 'Package', icon: Package, emoji: '📦' },
    { id: 'food', label: 'Food', icon: UtensilsCrossed, emoji: '🍔' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, emoji: '🛍️' },
    { id: 'gift', label: 'Gift', icon: Gift, emoji: '🎁' },
  ];

  // Vehicle types with pricing
  const vehicleTypes = [
    { id: 'bike', label: 'Bike', emoji: '🏍️', basePrice: 500, pricePerKm: 100, maxWeight: '5kg', eta: 'Fastest' },
    { id: 'car', label: 'Car', emoji: '🚗', basePrice: 1000, pricePerKm: 150, maxWeight: '20kg', eta: 'Standard' },
    { id: 'van', label: 'Van', emoji: '🚐', basePrice: 2500, pricePerKm: 250, maxWeight: '100kg', eta: 'For large items' },
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Wallet, description: 'Pay driver in cash' },
    { id: 'card', label: 'Card', icon: CreditCard, description: 'Debit/Credit card' },
    { id: 'ussd', label: 'USSD', icon: Smartphone, description: 'Bank transfer' },
  ];

  // Calculate route when locations change
  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickupLocation || !dropoffLocation) {
        setRoute(null);
        setRouteInfo(null);
        return;
      }

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coords);

          const distanceKm = data.routes[0].distance / 1000;
          const durationMins = Math.ceil(data.routes[0].duration / 60);

          setRouteInfo({
            distance: `${distanceKm.toFixed(1)} km`,
            distanceValue: data.routes[0].distance,
            duration: `${durationMins} mins`,
            durationValue: data.routes[0].duration
          });

          // Set initial price offer
          const vehicle = vehicleTypes.find(v => v.id === vehicleType);
          const calculatedPrice = Math.round(vehicle.basePrice + (distanceKm * vehicle.pricePerKm));
          setPriceOffer(calculatedPrice);
        }
      } catch (error) {
        console.error('Route error:', error);
      }
    };

    fetchRoute();
  }, [pickupLocation, dropoffLocation, vehicleType]);

  // Calculate price based on vehicle type
  const calculatePrice = () => {
    if (!routeInfo) return 0;
    const distanceKm = routeInfo.distanceValue / 1000;
    const vehicle = vehicleTypes.find(v => v.id === vehicleType);
    return Math.round(vehicle.basePrice + (distanceKm * vehicle.pricePerKm));
  };

  // Update price when vehicle changes
  useEffect(() => {
    if (routeInfo) {
      setPriceOffer(calculatePrice());
    }
  }, [vehicleType, routeInfo]);

  // Get current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setPickupLocation({
            address: data.display_name,
            lat: latitude,
            lng: longitude
          });
        } catch (error) {
          setPickupLocation({
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            lat: latitude,
            lng: longitude
          });
        }
      },
      (error) => {
        alert('Could not get location: ' + error.message);
      }
    );
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations');
      return;
    }

    setIsLoading(true);

    const order = {
      id: `ORD-${Date.now()}`,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      distance: routeInfo?.distance,
      duration: routeInfo?.duration,
      price: priceOffer,
      driverEarnings: Math.round(priceOffer * 0.8),
      packageType,
      packageDescription,
      vehicleType,
      paymentMethod,
      customer: {
        id: 'customer-123',
        name: 'John Doe',
        phone: '+234 801 234 5678',
        rating: 4.8
      },
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    try {
      // Connect and create order
      socketService.connect('customer-123', 'customer');
      socketService.createOrder(order);
      socketService.subscribeToOrder(order.id);

      setCreatedOrder(order);
      setOrderCreated(true);
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get map points
  const getMapPoints = () => {
    const points = [];
    if (pickupLocation) points.push([pickupLocation.lat, pickupLocation.lng]);
    if (dropoffLocation) points.push([dropoffLocation.lat, dropoffLocation.lng]);
    return points;
  };

  // Order Created Success Screen
  if (orderCreated && createdOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Created!</h1>
            <p className="text-gray-500 mb-6">Looking for nearby drivers...</p>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-medium">{createdOrder.id}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-green-600">₦{createdOrder.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="capitalize">{createdOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/track/${createdOrder.id}`)}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-4 shadow-sm z-20">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-900">
            {step === 1 && 'Select Locations'}
            {step === 2 && 'Package Details'}
            {step === 3 && 'Confirm Order'}
          </h1>
          <p className="text-sm text-gray-500">Step {step} of 3</p>
        </div>
        <img src="/logo.png" alt="Routa" className="w-8 h-8 object-contain" />
      </header>

      {/* Progress Bar */}
      <div className="bg-white px-4 pb-3">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="h-48 relative">
        <MapContainer
          center={[6.5244, 3.3792]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={getMapPoints()} />

          {/* Route */}
          {route && (
            <Polyline
              positions={route}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Markers */}
          {pickupLocation && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon} />
          )}
          {dropoffLocation && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon} />
          )}
        </MapContainer>

        {/* Route Info Overlay */}
        {routeInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white rounded-xl shadow-lg px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-700">
                  <Route className="w-4 h-4" />
                  <span className="font-medium">{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{routeInfo.duration}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Locations */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              {/* Pickup Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                  <button
                    onClick={useCurrentLocation}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    Use current
                  </button>
                </div>
                <LocationSearch
                  placeholder="Where should we pick up?"
                  value={pickupLocation}
                  onSelect={setPickupLocation}
                  icon={Package}
                  iconColor="bg-green-500"
                />
              </div>

              {/* Dropoff Location */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dropoff Location
                </label>
                <LocationSearch
                  placeholder="Where should we deliver?"
                  value={dropoffLocation}
                  onSelect={setDropoffLocation}
                  icon={MapPin}
                  iconColor="bg-orange-500"
                />
              </div>

              {/* Quick Suggestions */}
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-3">Recent locations</p>
                <div className="space-y-2">
                  {[
                    { name: 'Home', address: '45 Ikeja GRA, Lagos', icon: '🏠' },
                    { name: 'Office', address: '123 Victoria Island, Lagos', icon: '🏢' },
                  ].map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => setDropoffLocation({ address: loc.address, lat: 6.5 + i * 0.05, lng: 3.35 })}
                      className="w-full p-3 bg-white rounded-xl flex items-center gap-3 hover:bg-gray-50 transition border border-gray-100"
                    >
                      <span className="text-xl">{loc.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{loc.name}</p>
                        <p className="text-sm text-gray-500 truncate">{loc.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Package Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-6"
            >
              {/* Package Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  What are you sending?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {packageTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPackageType(type.id)}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        packageType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{type.emoji}</span>
                      <span className="text-xs text-gray-600">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description (optional)
                </label>
                <textarea
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="E.g., Fragile items, handle with care..."
                  className="w-full p-4 bg-gray-50 rounded-xl border-0 resize-none h-24 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Vehicle
                </label>
                <div className="space-y-3">
                  {vehicleTypes.map((vehicle) => {
                    const price = routeInfo 
                      ? Math.round(vehicle.basePrice + (routeInfo.distanceValue / 1000 * vehicle.pricePerKm))
                      : vehicle.basePrice;
                    
                    return (
                      <button
                        key={vehicle.id}
                        onClick={() => setVehicleType(vehicle.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                          vehicleType === vehicle.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <span className="text-3xl">{vehicle.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{vehicle.label}</p>
                          <p className="text-sm text-gray-500">
                            Up to {vehicle.maxWeight} • {vehicle.eta}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₦{price.toLocaleString()}</p>
                          {vehicleType === vehicle.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                
                {/* Locations */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                      <p className="text-gray-900 text-sm">{pickupLocation?.address}</p>
                    </div>
                  </div>

                  <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4" />

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">DROPOFF</p>
                      <p className="text-gray-900 text-sm">{dropoffLocation?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package</span>
                    <span className="font-medium capitalize">{packageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle</span>
                    <span className="font-medium flex items-center gap-2">
                      {vehicleTypes.find(v => v.id === vehicleType)?.emoji}
                      {vehicleTypes.find(v => v.id === vehicleType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-medium">{routeInfo?.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Time</span>
                    <span className="font-medium">{routeInfo?.duration}</span>
                  </div>
                </div>
              </div>

              {/* Price Offer */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Your Offer</h3>
                  <button
                    onClick={() => setShowPriceModal(true)}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Adjust
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPriceOffer(Math.max(0, priceOffer - 100))}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">₦{priceOffer.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Suggested: ₦{calculatePrice().toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setPriceOffer(priceOffer + 100)}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-3">
                  <Info className="w-4 h-4 inline mr-1" />
                  Higher offers get faster driver matches
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 mx-auto mb-1 ${
                        paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Insured</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="bg-white border-t p-4 safe-bottom">
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && (!pickupLocation || !dropoffLocation)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue
            <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
          </button>
        ) : (
          <button
            onClick={handleSubmitOrder}
            disabled={isLoading}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirm & Find Driver
              </>
            )}
          </button>
        )}
      </div>

      {/* Price Adjustment Modal */}
      <AnimatePresence>
        {showPriceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowPriceModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Set Your Price</h3>
                <button onClick={() => setShowPriceModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <input
                  type="number"
                  value={priceOffer}
                  onChange={(e) => setPriceOffer(Number(e.target.value))}
                  className="text-4xl font-bold text-center w-full bg-gray-50 rounded-xl p-4"
                />
                <p className="text-gray-500 mt-2">Suggested: ₦{calculatePrice().toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {[500, 1000, 1500, 2000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPriceOffer(amount)}
                    className="py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200"
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPriceModal(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Apply Price
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateOrder;