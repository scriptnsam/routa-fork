import { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const libraries = ['places'];

const LiveTrackingMap = ({ pickup, dropoff, driverLocation, status }) => {
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Center map on driver when location updates
  useEffect(() => {
    if (map && driverLocation) {
      map.panTo({ lat: driverLocation.lat, lng: driverLocation.lng });
    }
  }, [map, driverLocation]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const center = driverLocation || pickup || { lat: 6.5244, lng: 3.3792 };

  // Create path for polyline
  const getPath = () => {
    const path = [];
    if (driverLocation) path.push(driverLocation);
    if (status === 'ACCEPTED' || status === 'PICKED_UP') {
      if (pickup) path.push(pickup);
    }
    if (status === 'IN_TRANSIT' || status === 'PICKED_UP') {
      if (dropoff) path.push(dropoff);
    }
    return path;
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Pickup Marker */}
        {pickup && (
          <Marker
            position={{ lat: pickup.lat, lng: pickup.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
            title="Pickup Location"
          />
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker
            position={{ lat: dropoff.lat, lng: dropoff.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            title="Dropoff Location"
          />
        )}

        {/* Driver Marker - Animated */}
        {driverLocation && (
          <Marker
            position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#1E40AF',
              strokeWeight: 2,
              rotation: 0,
            }}
            title="Driver Location"
          />
        )}

        {/* Path line */}
        {getPath().length > 1 && (
          <Polyline
            path={getPath()}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 3,
              strokeDasharray: [10, 5],
            }}
          />
        )}
      </GoogleMap>

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
              <span className="text-sm">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;