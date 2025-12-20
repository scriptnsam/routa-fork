import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import {
  Package,
  MapPin,
  Navigation,
  Clock,
  Check,
  X,
  Bell,
  Power,
  Star,
  Phone,
  MessageSquare,
  Route,
  DollarSign
} from 'lucide-react';
import socketService from '../services/socketService';

// Custom icons
const createIcon = (color, emoji = '') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        font-size: 18px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const driverIcon = createIcon('#3b82f6', '🚗');
const pickupIcon = createIcon('#22c55e', '📍');
const dropoffIcon = createIcon('#ef4444', '🏁');

// Routing component for driver dashboard
const DriverRouting = ({ from, to, map }) => {
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5, opacity: 0.8 }]
      },
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      })
    }).addTo(map);

    // Hide the routing panel
    const container = document.querySelector('.leaflet-routing-container');
    if (container) {
      container.style.display = 'none';
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [from, to, map]);

  return null;
};

// Map wrapper component
const DriverMap = ({ currentLocation, activeOrder, orderStatus }) => {
  const [map, setMap] = useState(null);

  const getDestination = () => {
    if (!activeOrder) return null;
    
    if (orderStatus === 'picked_up' || orderStatus === 'arrived_dropoff') {
      return activeOrder.dropoff;
    }
    return activeOrder.pickup;
  };

  return (
    <MapContainer
      center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [6.5244, 3.3792]}
      zoom={15}
      style={{ height: '300px', width: '100%' }}
      ref={setMap}
      whenCreated={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Driver Location */}
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Active Order Markers */}
      {activeOrder && (
        <>
          <Marker 
            position={[activeOrder.pickup.lat, activeOrder.pickup.lng]} 
            icon={pickupIcon}
          >
            <Popup>Pickup: {activeOrder.pickup.address}</Popup>
          </Marker>
          <Marker 
            position={[activeOrder.dropoff.lat, activeOrder.dropoff.lng]} 
            icon={dropoffIcon}
          >
            <Popup>Dropoff: {activeOrder.dropoff.address}</Popup>
          </Marker>
        </>
      )}

      {/* Route */}
      {currentLocation && activeOrder && map && (
        <DriverRouting
          from={currentLocation}
          to={getDestination()}
          map={map}
        />
      )}
    </MapContainer>
  );
};

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0 });
  const [stats, setStats] = useState({ completed: 0, rating: 4.9 });

  // Mock driver ID - in real app, get from auth
  const driverId = 'driver-123';

  // Get driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Update location on server if online
          if (isOnline) {
            socketService.updateDriverLocation(driverId, location);
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOnline]);

  // Connect to socket and listen for orders
  useEffect(() => {
    socketService.connect(driverId, 'driver');

    // Listen for new orders
    socketService.onNewOrder((order) => {
      console.log('New order received:', order);
      setPendingOrders((prev) => {
        // Avoid duplicates
        if (prev.find(o => o.id === order.id)) return prev;
        return [...prev, order];
      });
      
      playNotificationSound();
      showBrowserNotification(order);
    });

    // Listen for order taken by another driver
    socketService.onOrderTaken((data) => {
      setPendingOrders((prev) => prev.filter((o) => o.id !== data.orderId));
    });

    // Listen for order updates
    socketService.onOrderUpdate((update) => {
      if (update.orderId === activeOrder?.id) {
        setOrderStatus(update.status);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [activeOrder]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Toggle online status
  const toggleOnlineStatus = () => {
    if (!isOnline) {
      if (currentLocation) {
        socketService.joinDriverPool(driverId, currentLocation);
        setIsOnline(true);
      } else {
        alert('Please enable location services to go online');
      }
    } else {
      socketService.leaveDriverPool(driverId);
      setIsOnline(false);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  // Show browser notification
  const showBrowserNotification = (order) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Delivery Request!', {
        body: `₦${order.price?.toLocaleString()} - ${order.distance}`,
        icon: '/logo.png',
        requireInteraction: true
      });
    }
  };

  // Accept order
  const acceptOrder = (order) => {
    socketService.acceptOrder(order.id, driverId);
    setActiveOrder(order);
    setOrderStatus('accepted');
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  // Reject order
  const rejectOrder = (orderId) => {
    socketService.rejectOrder(orderId, driverId);
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Update order status
  const updateStatus = (status) => {
    if (activeOrder) {
      socketService.updateOrderStatus(activeOrder.id, status);
      setOrderStatus(status);

      if (status === 'delivered') {
        // Order completed
        setEarnings((prev) => ({
          today: prev.today + (activeOrder.driverEarnings || 500),
          week: prev.week + (activeOrder.driverEarnings || 500)
        }));
        setStats((prev) => ({ ...prev, completed: prev.completed + 1 }));
        setActiveOrder(null);
        setOrderStatus(null);
      }
    }
  };

  // Get status button config
  const getStatusButton = () => {
    switch (orderStatus) {
      case 'accepted':
        return { text: 'Arrived at Pickup', nextStatus: 'arrived_pickup', color: 'bg-blue-600' };
      case 'arrived_pickup':
        return { text: 'Package Picked Up', nextStatus: 'picked_up', color: 'bg-blue-600' };
      case 'picked_up':
        return { text: 'Arrived at Dropoff', nextStatus: 'arrived_dropoff', color: 'bg-blue-600' };
      case 'arrived_dropoff':
        return { text: 'Complete Delivery', nextStatus: 'delivered', color: 'bg-green-600' };
      default:
        return null;
    }
  };

  const statusButton = getStatusButton();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Routa" className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-lg">Driver Mode</h1>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isOnline ? '● Online' : '○ Offline'}
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleOnlineStatus}
          className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 transition ${
            isOnline 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Power className="w-5 h-5" />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₦{earnings.today.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Today's Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
            </div>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Map */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <DriverMap
            currentLocation={currentLocation}
            activeOrder={activeOrder}
            orderStatus={orderStatus}
          />
        </div>

        {/* Pending Orders */}
        <AnimatePresence>
          {pendingOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 animate-bounce" />
                  <span className="font-bold">New Delivery Request!</span>
                </div>
                <div className="text-xl font-bold">₦{order.price?.toLocaleString()}</div>
              </div>

              {/* Order Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase">Pickup</p>
                    <p className="font-medium text-sm">{order.pickup?.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase">Dropoff</p>
                    <p className="font-medium text-sm">{order.dropoff?.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Route className="w-4 h-4" />
                    <span>{order.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{order.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{order.packageType || 'Package'}</span>
                  </div>
                </div>

                {/* Customer Info */}
                {order.customer && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{order.customer.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => rejectOrder(order.id)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Decline
                  </button>
                  <button
                    onClick={() => acceptOrder(order)}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Active Order */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Active Delivery</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                orderStatus === 'picked_up' || orderStatus === 'arrived_dropoff'
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {orderStatus === 'picked_up' ? 'En Route to Dropoff' : 
                 orderStatus === 'arrived_dropoff' ? 'At Dropoff' :
                 orderStatus === 'arrived_pickup' ? 'At Pickup' : 
                 'Heading to Pickup'}
              </span>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  orderStatus === 'picked_up' || orderStatus === 'arrived_dropoff' 
                    ? 'bg-gray-300' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="text-xs text-gray-500">PICKUP</p>
                  <p className="font-medium text-sm">{activeOrder.pickup?.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  orderStatus === 'picked_up' || orderStatus === 'arrived_dropoff' 
                    ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <div>
                  <p className="text-xs text-gray-500">DROPOFF</p>
                  <p className="font-medium text-sm">{activeOrder.dropoff?.address}</p>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-green-700">You'll earn</span>
              </div>
              <span className="font-bold text-green-700 text-lg">
                ₦{(activeOrder.driverEarnings || activeOrder.price * 0.8)?.toLocaleString()}
              </span>
            </div>

            {/* Customer Contact */}
            {activeOrder.customer && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-medium">{activeOrder.customer.name}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${activeOrder.customer.phone || ''}`}
                    className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200 transition"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <button className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Status Update Button */}
            {statusButton && (
              <button
                onClick={() => updateStatus(statusButton.nextStatus)}
                className={`w-full py-4 ${statusButton.color} text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2`}
              >
                {statusButton.nextStatus === 'delivered' && <Check className="w-5 h-5" />}
                {statusButton.text}
              </button>
            )}
          </motion.div>
        )}

        {/* Empty State - Online but no orders */}
        {isOnline && pendingOrders.length === 0 && !activeOrder && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Waiting for orders</h3>
            <p className="text-gray-500">New delivery requests will appear here</p>
          </div>
        )}

        {/* Offline State */}
        {!isOnline && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">You're offline</h3>
            <p className="text-gray-500 mb-4">Go online to start receiving delivery requests</p>
            <button
              onClick={toggleOnlineStatus}
              className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
            >
              Go Online
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;