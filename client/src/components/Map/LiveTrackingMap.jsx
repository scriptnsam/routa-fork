// At the top of LiveTrackingMap.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import {
  Phone,
  MessageSquare,
  Navigation,
  Package,
  Clock,
  MapPin,
  ChevronUp,
  ChevronDown,
  Share2,
  AlertCircle,
  CheckCircle,
  Truck,
  Home,
  Star,
  X,
  Copy,
  Check
} from 'lucide-react';
import socketService from '../../services/socketService';  // ← Fixed path



// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color, emoji, size = 32) => {
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

const pickupIcon = createIcon('#22c55e', '📦', 32);
const dropoffIcon = createIcon('#f97316', '📍', 32);
const driverIcon = createIcon('#3b82f6', '🛵', 44);

// Component to follow driver
const FollowDriver = ({ driverLocation, shouldFollow }) => {
  const map = useMap();

  useEffect(() => {
    if (driverLocation && shouldFollow) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
    }
  }, [driverLocation, shouldFollow, map]);

  return null;
};

// Component to fit all markers
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [points, map]);

  return null;
};

// Status Steps Component
const StatusSteps = ({ currentStatus }) => {
  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: Package },
    { key: 'ACCEPTED', label: 'Driver Assigned', icon: CheckCircle },
    { key: 'PICKED_UP', label: 'Package Picked Up', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const getStepStatus = (stepKey) => {
    const order = ['PENDING', 'ACCEPTED', 'ARRIVED_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DROPOFF', 'DELIVERED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);
    
    if (stepKey === 'PICKED_UP' && ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DROPOFF', 'DELIVERED'].includes(currentStatus)) {
      return 'completed';
    }
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-between px-2">
      {steps.map((step, index) => {
        const status = getStepStatus(step.key);
        const Icon = step.icon;
        
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-blue-500 text-white animate-pulse' : ''}
                ${status === 'upcoming' ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1 text-center max-w-[60px] ${
                status === 'upcoming' ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${
                getStepStatus(steps[index + 1].key) !== 'upcoming' 
                  ? 'bg-green-500' 
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Main Component
const OrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [driverRoute, setDriverRoute] = useState(null);
  const [eta, setEta] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldFollowDriver, setShouldFollowDriver] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock order data - Replace with real API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setOrder({
        id: orderId || 'ORD-123456',
        status: 'PICKED_UP',
        pickup: {
          address: '123 Victoria Island, Lagos',
          lat: 6.4281,
          lng: 3.4219
        },
        dropoff: {
          address: '45 Ikeja GRA, Lagos',
          lat: 6.5833,
          lng: 3.3500
        },
        driver: {
          name: 'Chidi Okonkwo',
          phone: '+234 801 234 5678',
          rating: 4.9,
          trips: 342,
          vehicle: 'Honda Ace 125',
          plateNumber: 'LAG-234-XY'
        },
        package: {
          type: 'Document',
          description: 'Important documents',
          price: 1500
        },
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 20 * 60000).toISOString()
      });
      setIsLoading(false);
    }, 1000);
  }, [orderId]);

  // Connect to socket for real-time updates
  useEffect(() => {
    if (!order) return;

    socketService.connect('customer-123', 'customer');
    socketService.subscribeToOrder(order.id);

    socketService.onDriverLocationUpdate((data) => {
      setDriverLocation(data.location);
    });

    socketService.onOrderUpdate((update) => {
      setOrder(prev => ({ ...prev, status: update.status }));
    });

    // Simulate driver movement for demo
    const interval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) {
          return { lat: 6.4500, lng: 3.4000 };
        }
        return {
          lat: prev.lat + (Math.random() - 0.3) * 0.002,
          lng: prev.lng + (Math.random() - 0.3) * 0.002
        };
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      socketService.unsubscribeFromOrder(order.id);
      socketService.disconnect();
    };
  }, [order?.id]);

  // Fetch routes
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!order?.pickup || !order?.dropoff) return;

      try {
        // Main route (pickup to dropoff)
        const mainRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${order.pickup.lng},${order.pickup.lat};${order.dropoff.lng},${order.dropoff.lat}?overview=full&geometries=geojson`
        );
        const mainData = await mainRes.json();
        
        if (mainData.routes?.[0]) {
          const coords = mainData.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coords);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoutes();
  }, [order?.pickup, order?.dropoff]);

  // Fetch driver route and ETA
  useEffect(() => {
    const fetchDriverRoute = async () => {
      if (!driverLocation || !order) return;

      const destination = ['ACCEPTED', 'ARRIVED_PICKUP'].includes(order.status)
        ? order.pickup
        : order.dropoff;

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setDriverRoute(coords);
          
          // Calculate ETA
          const durationMinutes = Math.ceil(data.routes[0].duration / 60);
          setEta(durationMinutes);
        }
      } catch (error) {
        console.error('Error fetching driver route:', error);
      }
    };

    fetchDriverRoute();
  }, [driverLocation, order?.status]);

  // Copy tracking link
  const copyTrackingLink = () => {
    navigator.clipboard.writeText(`https://routa.app/track/${order?.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get status message
  const getStatusMessage = () => {
    const messages = {
      PENDING: 'Looking for a driver...',
      ACCEPTED: 'Driver is heading to pickup',
      ARRIVED_PICKUP: 'Driver arrived at pickup',
      PICKED_UP: 'Package picked up, on the way!',
      IN_TRANSIT: 'Your package is on the way',
      ARRIVED_DROPOFF: 'Driver has arrived!',
      DELIVERED: 'Package delivered successfully!'
    };
    return messages[order?.status] || 'Processing...';
  };

  // Get status color
  const getStatusColor = () => {
    if (['DELIVERED'].includes(order?.status)) return 'bg-green-500';
    if (['PICKED_UP', 'IN_TRANSIT'].includes(order?.status)) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find this order.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const allPoints = [
    order.pickup && [order.pickup.lat, order.pickup.lng],
    order.dropoff && [order.dropoff.lat, order.dropoff.lng],
    driverLocation && [driverLocation.lat, driverLocation.lng]
  ].filter(Boolean);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronDown className="w-6 h-6 text-gray-600 rotate-90" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Track Order</h1>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowShareModal(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={driverLocation ? [driverLocation.lat, driverLocation.lng] : [6.5244, 3.3792]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={allPoints} />
          <FollowDriver driverLocation={driverLocation} shouldFollow={shouldFollowDriver} />

          {/* Main Route (gray dashed) */}
          {route && (
            <Polyline
              positions={route}
              color="#9ca3af"
              weight={4}
              opacity={0.6}
              dashArray="8, 12"
            />
          )}

          {/* Driver Route (blue solid) */}
          {driverRoute && (
            <Polyline
              positions={driverRoute}
              color="#3b82f6"
              weight={5}
              opacity={0.9}
            />
          )}

          {/* Pickup Marker */}
          {order.pickup && (
            <Marker position={[order.pickup.lat, order.pickup.lng]} icon={pickupIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-green-600">📦 Pickup</strong>
                  <p className="text-sm text-gray-600 mt-1">{order.pickup.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {order.dropoff && (
            <Marker position={[order.dropoff.lat, order.dropoff.lng]} icon={dropoffIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-orange-600">📍 Dropoff</strong>
                  <p className="text-sm text-gray-600 mt-1">{order.dropoff.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-blue-600">🛵 {order.driver.name}</strong>
                  <p className="text-sm text-gray-600">{order.driver.vehicle}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* ETA Overlay */}
        {eta && order.status !== 'DELIVERED' && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getStatusColor()} rounded-full flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated arrival</p>
                    <p className="text-2xl font-bold text-gray-900">{eta} mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recenter Button */}
        <button
          onClick={() => setShouldFollowDriver(true)}
          className="absolute bottom-48 right-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-3xl shadow-2xl z-20"
      >
        {/* Handle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex justify-center"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </button>

        {/* Status */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 ${getStatusColor()} rounded-full animate-pulse`} />
            <p className="font-semibold text-gray-900">{getStatusMessage()}</p>
          </div>

          {/* Progress Steps */}
          <StatusSteps currentStatus={order.status} />
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4 border-t pt-4">
                {/* Driver Info */}
                {order.driver && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        🧑
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.driver.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{order.driver.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{order.driver.trips} trips</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.driver.vehicle} • {order.driver.plateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${order.driver.phone}`}
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                      <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Locations */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                      <p className="text-gray-900">{order.pickup.address}</p>
                    </div>
                  </div>

                  <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4" />

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">DROPOFF</p>
                      <p className="text-gray-900">{order.dropoff.address}</p>
                    </div>
                  </div>
                </div>

                {/* Package & Price */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{order.package.type}</p>
                      <p className="text-sm text-gray-500">{order.package.description}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    ₦{order.package.price.toLocaleString()}
                  </p>
                </div>

                {/* Help Button */}
                <button className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Report an Issue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 border-t flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-5 h-5" />
              <span className="text-sm">Show less</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm">Show details</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Share Tracking</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 truncate">
                    <p className="text-sm text-gray-500">Tracking Link</p>
                    <p className="text-gray-900 truncate">https://routa.app/track/{order.id}</p>
                  </div>
                  <button
                    onClick={copyTrackingLink}
                    className={`p-3 rounded-xl transition ${
                      copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Share this link so others can track this delivery in real-time
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderTracking;