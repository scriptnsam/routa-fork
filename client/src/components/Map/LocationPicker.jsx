import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const libraries = ['places'];

const LocationPicker = ({ label, value, onChange, placeholder }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(value || null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setMarker({ lat, lng });
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onChange({
          lat,
          lng,
          address: results[0].formatted_address,
        });
      } else {
        onChange({ lat, lng, address: '' });
      }
    });
  }, [onChange]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarker({ lat, lng });
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        
        onChange({
          lat,
          lng,
          address: place.formatted_address,
        });
      }
    }
  };

  if (loadError) {
    return <div className="text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="h-[300px] bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-bold">{label}</label>
      
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder={placeholder || 'Search for a location...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          defaultValue={value?.address || ''}
        />
      </Autocomplete>

      <div className="rounded-lg overflow-hidden border border-gray-300">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker || { lat: 6.5244, lng: 3.3792 }}
          zoom={marker ? 15 : 12}
          onLoad={onLoad}
          onClick={onMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>

      {value?.address && (
        <p className="text-sm text-gray-600">
          📍 {value.address}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;