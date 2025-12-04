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
  html: `<div style="background-color: #22C55E; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const dropoffIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #EF4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">📦</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const driverIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #3B82F6; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚗</div>`,
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

// Component to fit bounds
const FitBounds = ({ pickup, dropoff, driverLocation }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (dropoff) points.push([dropoff.lat, dropoff.lng]);
    if (driverLocation) points.push([driverLocation.lat, driverLocation.lng]);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [pickup, dropoff, driverLocation, map]);

  return null;
};

const RouteMap = ({ pickup, dropoff, driverLocation }) => {
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const defaultCenter = [6.5244, 3.3792];

  // Fetch route from OSRM (Open Source Routing Machine)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !dropoff) return;

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          // Convert GeoJSON coordinates to Leaflet format [lat, lng]
          const coordinates = routeData.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coordinates);
          setRouteInfo({
            distance: (routeData.distance / 1000).toFixed(1), // km
            duration: Math.round(routeData.duration / 60), // minutes
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [pickup, dropoff]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <div className="h-[400px]">
        <MapContainer
          center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />

          {/* Route Line */}
          {route && (
            <Polyline
              positions={route}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Pickup Marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Popup>
                <strong>Pickup Location</strong>
                <br />
                {pickup.address || 'Pickup point'}
              </Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {dropoff && (
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
              <Popup>
                <strong>Dropoff Location</strong>
                <br />
                {dropoff.address || 'Dropoff point'}
              </Popup>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <strong>Driver Location</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend & Route Info */}
      <div className="p-3 bg-white border-t flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Pickup</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span>Dropoff</span>
          </div>
          {driverLocation && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Driver</span>
            </div>
          )}
        </div>
        {routeInfo && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{routeInfo.distance} km</span>
            <span className="mx-2">•</span>
            <span>{routeInfo.duration} min</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMap;