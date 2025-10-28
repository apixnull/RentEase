import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchAddress = async () => {
    if (!lat || !lon) {
      setError("Please enter both latitude and longitude.");
      return;
    }

    setLoading(true);
    setError("");
    setAddress("");

    try {
      const response = await fetch(
        `https://free.geodescription.com/text?lat=${lat}&lon=${lon}`
      );

      if (!response.ok) throw new Error("Failed to fetch location");

      const text = await response.text();
      setAddress(text);
    } catch (err) {
      setError("Could not fetch location. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Maintenance Location Lookup</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium">Latitude</label>
        <Input
          type="number"
          placeholder="Enter latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />

        <label className="text-sm font-medium">Longitude</label>
        <Input
          type="number"
          placeholder="Enter longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />

        <Button
          onClick={handleFetchAddress}
          disabled={loading}
          className="w-full mt-3"
        >
          {loading ? "Fetching..." : "Get Address"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {address && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Result:</strong> {address}
          </p>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
