import { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const libraries = ['places'];

const RouteMap = ({ pickup, dropoff, driverLocation }) => {
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Calculate route
  useEffect(() => {
    if (!isLoaded || !pickup || !dropoff) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [isLoaded, pickup, dropoff]);

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

  const center = pickup || { lat: 6.5244, lng: 3.3792 };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
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

        {/* Driver Location */}
        {driverLocation && (
          <Marker
            position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            title="Driver Location"
          />
        )}

        {/* Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 4,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="p-3 bg-white border-t flex gap-4 text-sm">
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
    </div>
  );
};

export default RouteMap;