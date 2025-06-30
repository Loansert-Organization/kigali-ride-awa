import { LocationPicker } from '@/components/maps/LocationPicker';

const MapTestPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Map Component Test</h1>
      <p className="mb-4">
        If you see the "Something went wrong" error, please check the browser's JavaScript console.
        The issue is likely a missing or misconfigured Google Maps API key in your environment.
      </p>
      <LocationPicker
        title="Test Location Picker"
        onLocationSelect={(location) => {
          console.log('Location Selected:', location);
          alert(`Selected: ${location.address}`);
        }}
      />
    </div>
  );
};

export default MapTestPage; 