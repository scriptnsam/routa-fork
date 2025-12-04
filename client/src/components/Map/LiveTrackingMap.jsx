import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #22C55E; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const dropoffIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #EF4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">📦</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const driverIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #3B82F6; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 20px; animation: pulse 2s infinite;">🚗</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to follow driver
const FollowDriver = ({ driverLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (driverLocation) {
      map.panTo([driverLocation.lat, driverLocation.lng]);
    }
  }, [driverLocation, map]);

  return null;
};

// Component to fit all markers
const FitAllMarkers = ({ pickup, dropoff, driverLocation }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (dropoff) points.push([dropoff.lat, dropoff.lng]);
    if (driverLocation) points.push([driverLocation.lat, driverLocation.lng]);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, []);

  return null;
};

const LiveTrackingMap = ({ pickup, dropoff, driverLocation, status }) => {
  const [route, setRoute] = useState(null);
  const [routeToDestination, setRouteToDestination] = useState(null);

  const defaultCenter = [6.5244, 3.3792];

  // Fetch main route (pickup to dropoff)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !dropoff) return;

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coordinates);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [pickup, dropoff]);

  // Fetch driver route to current destination
  useEffect(() => {
    const fetchDriverRoute = async () => {
      if (!driverLocation) return;

      // Determine destination based on status
      let destination;
      if (status === 'ACCEPTED') {
        destination = pickup;
      } else if (['PICKED_UP', 'IN_TRANSIT'].includes(status)) {
        destination = dropoff;
      }

      if (!destination) return;

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteToDestination(coordinates);
        }
      } catch (error) {
        console.error('Error fetching driver route:', error);
      }
    };

    fetchDriverRoute();
  }, [driverLocation, status, pickup, dropoff]);

  const getCenter = () => {
    if (driverLocation) return [driverLocation.lat, driverLocation.lng];
    if (pickup) return [pickup.lat, pickup.lng];
    return defaultCenter;
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      {/* Add CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="h-[400px]">
        <MapContainer
          center={getCenter()}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitAllMarkers pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />
          
          {driverLocation && <FollowDriver driverLocation={driverLocation} />}

          {/* Main Route (gray/dashed) */}
          {route && (
            <Polyline
              positions={route}
              color="#94A3B8"
              weight={4}
              opacity={0.6}
              dashArray="10, 10"
            />
          )}

          {/* Driver Route (blue/solid) */}
          {routeToDestination && (
            <Polyline
              positions={routeToDestination}
              color="#3B82F6"
              weight={5}
              opacity={0.9}
            />
          )}

          {/* Pickup Marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Popup>
                <strong>📍 Pickup</strong>
              </Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {dropoff && (
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
              <Popup>
                <strong>📦 Dropoff</strong>
              </Popup>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <strong>🚗 Driver</strong>
                <br />
                Live Location
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-white border-t">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Pickup</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Dropoff</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Driver</span>
            </div>
          </div>
          {driverLocation && (
            <div className="flex items-center gap-1 text-green-600">
              <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;