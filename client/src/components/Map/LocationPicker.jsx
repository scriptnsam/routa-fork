import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      // Reverse geocode using Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();
        const address = data.display_name || 'Unknown location';
        
        onLocationSelect({ lat, lng, address });
      } catch (error) {
        onLocationSelect({ lat, lng, address: 'Unknown location' });
      }
    },
  });
  return null;
};

// Component to recenter map
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 15);
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ label, value, onChange, placeholder, markerColor = '#3B82F6' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const defaultCenter = [6.5244, 3.3792]; // Lagos, Nigeria

  // Search for address using Nominatim
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    onChange(location);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleLocationSelect = (location) => {
    onChange(location);
    setSearchQuery(location.address);
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-bold">{label}</label>

      {/* Search Box */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
            placeholder={placeholder || 'Search for a location...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={searchAddress}
            disabled={searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {searching ? '...' : '🔍'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
              >
                <p className="text-sm text-gray-800 truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={value ? [value.lat, value.lng] : defaultCenter}
          zoom={value ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {value && (
            <>
              <Marker
                position={[value.lat, value.lng]}
                icon={createIcon(markerColor)}
              />
              <RecenterMap position={value} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Selected Location */}
      {value?.address && (
        <p className="text-sm text-gray-600">
          📍 {value.address}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;