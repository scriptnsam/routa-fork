import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import {
  Package,
  Clock,
  Check,
  X,
  Bell,
  Power,
  Star,
  Phone,
  MessageSquare,
  Navigation,
  ChevronRight,
  Menu,
  User,
  Wallet,
  History,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  MapPin,
  AlertCircle
} from 'lucide-react';
import socketService from '../services/socketService';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        font-size: 16px;
      ">${symbol}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const driverIcon = createCustomIcon('#3b82f6', '🚗');
const pickupIcon = createCustomIcon('#22c55e', '📦');
const dropoffIcon = createCustomIcon('#ef4444', '📍');

// Routing Machine Component
const RoutingControl = ({ from, to }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    // Clean up previous route
    if (routingRef.current) {
      try {
        map.removeControl(routingRef.current);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    try {
      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(from.lat, from.lng),
          L.latLng(to.lat, to.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
        },
        createMarker: () => null,
      }).addTo(map);

      // Hide the instructions panel
      setTimeout(() => {
        const container = document.querySelector('.leaflet-routing-container');
        if (container) container.style.display = 'none';
      }, 100);
    } catch (error) {
      console.log('Routing error:', error);
    }

    return () => {
      if (routingRef.current) {
        try {
          map.removeControl(routingRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [from, to, map]);

  return null;
};

// Map Center Component
const MapCenter = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

// Main Driver Dashboard Component
const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 15500, total: 125000 });
  const [stats, setStats] = useState({ completed: 47, rating: 4.9, acceptance: 95 });
  
  const driverId = 'driver-123'; // Get from auth in real app

  // Watch location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(loc);
        if (isOnline) {
          socketService.updateDriverLocation(driverId, loc);
        }
      },
      (err) => console.log('Location error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, driverId]);

  // Socket connection
  useEffect(() => {
    socketService.connect(driverId, 'driver');

    socketService.onNewOrder((order) => {
      setPendingOrders((prev) => {
        if (prev.find((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      playSound();
      showNotification(order);
    });

    socketService.onOrderTaken((data) => {
      setPendingOrders((prev) => prev.filter((o) => o.id !== data.orderId));
    });

    socketService.onOrderUpdate((update) => {
      if (activeOrder?.id === update.orderId) {
        setOrderStatus(update.status);
      }
    });

    return () => socketService.disconnect();
  }, [activeOrder, driverId]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playSound = () => {
    try {
      new Audio('/notification.mp3').play();
    } catch (e) {
      console.log('Sound not available');
    }
  };

  const showNotification = (order) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Order Request', {
        body: `₦${order.price?.toLocaleString()} • ${order.distance || 'N/A'}`,
        icon: '/logo.png'
      });
    }
  };

  const toggleOnline = () => {
    if (!isOnline) {
      if (currentLocation) {
        socketService.joinDriverPool(driverId, currentLocation);
        setIsOnline(true);
      } else {
        alert('Enable location to go online');
      }
    } else {
      socketService.leaveDriverPool(driverId);
      setIsOnline(false);
    }
  };

  const acceptOrder = (order) => {
    socketService.acceptOrder(order.id, driverId);
    setActiveOrder(order);
    setOrderStatus('accepted');
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  const declineOrder = (orderId) => {
    socketService.rejectOrder(orderId, driverId);
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const updateOrderStatus = (newStatus) => {
    if (!activeOrder) return;
    
    socketService.updateOrderStatus(activeOrder.id, newStatus);
    setOrderStatus(newStatus);

    if (newStatus === 'delivered') {
      const earned = activeOrder.driverEarnings || activeOrder.price * 0.8 || 500;
      setEarnings((prev) => ({
        ...prev,
        today: prev.today + earned,
        total: prev.total + earned
      }));
      setStats((prev) => ({ ...prev, completed: prev.completed + 1 }));
      setActiveOrder(null);
      setOrderStatus(null);
    }
  };

  const getNextAction = () => {
    const actions = {
      accepted: { label: 'Arrived at Pickup', next: 'arrived_pickup' },
      arrived_pickup: { label: 'Start Delivery', next: 'picked_up' },
      picked_up: { label: 'Arrived at Dropoff', next: 'arrived_dropoff' },
      arrived_dropoff: { label: 'Complete Delivery', next: 'delivered' }
    };
    return actions[orderStatus] || null;
  };

  const getStatusLabel = () => {
    const labels = {
      accepted: 'Go to pickup location',
      arrived_pickup: 'Waiting for package',
      picked_up: 'Heading to dropoff',
      arrived_dropoff: 'Confirm delivery'
    };
    return labels[orderStatus] || '';
  };

  const getDestination = () => {
    if (!activeOrder) return null;
    return ['picked_up', 'arrived_dropoff'].includes(orderStatus) 
      ? activeOrder.dropoff 
      : activeOrder.pickup;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-xl"
            >
              {/* Profile Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    👨‍✈️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">John Driver</h3>
                    <div className="flex items-center gap-1 text-sm text-blue-100">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{stats.rating} Rating</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-blue-100">Total Earnings</span>
                  <span className="font-bold">₦{earnings.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {[
                  { icon: User, label: 'My Profile', path: '/driver/profile' },
                  { icon: Wallet, label: 'Earnings', path: '/driver/earnings' },
                  { icon: History, label: 'Trip History', path: '/driver/history' },
                  { icon: TrendingUp, label: 'Performance', path: '/driver/performance' },
                  { icon: Settings, label: 'Settings', path: '/driver/settings' },
                  { icon: HelpCircle, label: 'Help & Support', path: '/driver/support' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setShowSidebar(false)}
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition">
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Routa" className="w-8 h-8 object-contain" />
            <span className="font-bold text-gray-900">Routa</span>
          </div>
        </div>

        {/* Online Toggle */}
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
            isOnline
              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          <Power className="w-5 h-5" />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [6.5244, 3.3792]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapCenter position={currentLocation} />

          {/* Driver Marker */}
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {/* Order Markers */}
          {activeOrder?.pickup && (
            <Marker position={[activeOrder.pickup.lat, activeOrder.pickup.lng]} icon={pickupIcon}>
              <Popup>Pickup: {activeOrder.pickup.address}</Popup>
            </Marker>
          )}
          {activeOrder?.dropoff && (
            <Marker position={[activeOrder.dropoff.lat, activeOrder.dropoff.lng]} icon={dropoffIcon}>
              <Popup>Dropoff: {activeOrder.dropoff.address}</Popup>
            </Marker>
          )}

          {/* Route */}
          {currentLocation && activeOrder && (
            <RoutingControl from={currentLocation} to={getDestination()} />
          )}
        </MapContainer>

        {/* Stats Overlay - Only when online and no active order */}
        {isOnline && !activeOrder && pendingOrders.length === 0 && (
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">₦{earnings.today.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-xs text-gray-500">Trips</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{stats.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting for Orders */}
        {isOnline && !activeOrder && pendingOrders.length === 0 && (
          <div className="absolute bottom-24 left-4 right-4 z-20">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Looking for orders...</h3>
              <p className="text-gray-500 text-sm">Stay in a busy area to get more requests</p>
            </div>
          </div>
        )}

        {/* Offline State */}
        {!isOnline && (
          <div className="absolute bottom-24 left-4 right-4 z-20">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Power className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">You're Offline</h3>
              <p className="text-gray-500 text-sm mb-4">Go online to start receiving orders</p>
              <button
                onClick={toggleOnline}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                Go Online
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Order Request Card */}
      <AnimatePresence>
        {pendingOrders.length > 0 && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-30"
          >
            <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white animate-bounce" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">New Order Request</p>
                      <p className="text-blue-100 text-sm">{pendingOrders.length} pending</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ₦{pendingOrders[0]?.price?.toLocaleString() || '0'}
                    </p>
                    <p className="text-blue-100 text-sm">
                      {pendingOrders[0]?.distance || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6 space-y-4">
                {/* Locations */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase">Pickup</p>
                      <p className="text-gray-900 font-medium">
                        {pendingOrders[0]?.pickup?.address || 'Loading...'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4" />

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase">Dropoff</p>
                      <p className="text-gray-900 font-medium">
                        {pendingOrders[0]?.dropoff?.address || 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{pendingOrders[0]?.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">{pendingOrders[0]?.packageType || 'Package'}</span>
                    </div>
                  </div>
                  {pendingOrders[0]?.customer && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        👤
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pendingOrders[0].customer.name || 'Customer'}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-500">
                            {pendingOrders[0].customer.rating || '4.5'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => declineOrder(pendingOrders[0].id)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Decline
                  </button>
                  <button
                    onClick={() => acceptOrder(pendingOrders[0])}
                    className="flex-[2] py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Order Panel */}
      {activeOrder && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="bg-white rounded-t-3xl shadow-2xl">
            {/* Status Banner */}
            <div className={`px-6 py-3 ${
              ['picked_up', 'arrived_dropoff'].includes(orderStatus)
                ? 'bg-blue-600'
                : 'bg-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{getStatusLabel()}</span>
                </div>
                <span className="text-white/80 text-sm">
                  {activeOrder.distance || ''}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Locations */}
              <div className="space-y-3">
                <div className={`flex items-start gap-3 ${
                  ['picked_up', 'arrived_dropoff'].includes(orderStatus) ? 'opacity-50' : ''
                }`}>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className={`w-4 h-4 ${
                      ['picked_up', 'arrived_dropoff'].includes(orderStatus) 
                        ? 'text-green-500' 
                        : 'text-gray-300'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pickup</p>
                    <p className="text-gray-900 font-medium text-sm">
                      {activeOrder.pickup?.address || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-dashed border-gray-200 h-3" />

                <div className={`flex items-start gap-3 ${
                  !['picked_up', 'arrived_dropoff'].includes(orderStatus) ? 'opacity-50' : ''
                }`}>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Dropoff</p>
                    <p className="text-gray-900 font-medium text-sm">
                      {activeOrder.dropoff?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Earnings */}
              <div className="flex items-center justify-between py-3 bg-gray-50 rounded-xl px-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activeOrder.customer?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeOrder.customer?.phone || ''}`}
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Earnings Badge */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-green-700 font-medium">Your Earnings</span>
                <span className="text-xl font-bold text-green-600">
                  ₦{(activeOrder.driverEarnings || activeOrder.price * 0.8 || 0).toLocaleString()}
                </span>
              </div>

              {/* Action Button */}
              {getNextAction() && (
                <button
                  onClick={() => updateOrderStatus(getNextAction().next)}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                    getNextAction().next === 'delivered'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {getNextAction().next === 'delivered' && <Check className="w-5 h-5" />}
                  {getNextAction().label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;