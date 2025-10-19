import React, { createContext, useState, useContext, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { Coordinates, SavedAddress } from "../types";

interface LocationContextType {
  location: Location.LocationObject | null;
  userLocation: string | null;
  coordinates: Coordinates | null;
  loading: boolean;
  savedAddresses: SavedAddress[];
  currentAddress: SavedAddress | null;
  requestLocation: () => Promise<void>;
  setCurrentAddress: (address: SavedAddress) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, updateUserProfile, userData } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [currentAddress, setCurrentAddressState] =
    useState<SavedAddress | null>(null);

  useEffect(() => {
    if (user && !userData?.location) {
      setTimeout(() => {
        requestLocation();
      }, 500);
    } else if (userData?.savedAddresses) {
      setSavedAddresses(userData.savedAddresses);
      const activeAddr = userData.savedAddresses.find((addr) => addr.isActive);
      if (activeAddr) {
        setCurrentAddressState(activeAddr);
        setUserLocation(activeAddr.address);
        setCoordinates(activeAddr.coordinates);
      }
    }
  }, [user, userData]);

  const reverseGeocode = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];

        const address = [addr.street, addr.city, addr.region, addr.postalCode]
          .filter(Boolean)
          .join(", ");

        return {
          address:
            address ||
            `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
          coordinates: coords,
        };
      }

      return {
        address: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(
          4
        )}`,
        coordinates: coords,
      };
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return {
        address: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(
          4
        )}`,
        coordinates: coords,
      };
    }
  };

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Please enable location access to find restaurants near you.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      const coords: Coordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setCoordinates(coords);

      const { address } = await reverseGeocode(coords);

      setUserLocation(address);

      // Create new address
      const newAddress: SavedAddress = {
        id: Date.now().toString(),
        label: "Current Location",
        address,
        coordinates: coords,
        isActive: true,
      };

      // Keep max 2 addresses - remove oldest if exceeding
      let updatedAddresses = [...savedAddresses];

      // Deactivate all existing
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isActive: false,
      }));

      // Add new address
      updatedAddresses.push(newAddress);

      // Keep only last 2 addresses
      if (updatedAddresses.length > 2) {
        updatedAddresses = updatedAddresses.slice(-2);
      }

      setSavedAddresses(updatedAddresses);
      setCurrentAddressState(newAddress);

      if (user) {
        await updateUserProfile({
          location: address,
          coordinates: coords,
          savedAddresses: updatedAddresses,
        });
      }
    } catch (error: any) {
      console.error("❌ Location error:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setCurrentAddress = (address: SavedAddress) => {
    // Update active status
    const updatedAddresses = savedAddresses.map((addr) => ({
      ...addr,
      isActive: addr.id === address.id,
    }));

    setSavedAddresses(updatedAddresses);
    setCurrentAddressState(address);
    setUserLocation(address.address);
    setCoordinates(address.coordinates);

    if (user) {
      updateUserProfile({
        location: address.address,
        coordinates: address.coordinates,
        savedAddresses: updatedAddresses,
      });
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        userLocation,
        coordinates,
        loading,
        savedAddresses,
        currentAddress,
        requestLocation,
        setCurrentAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};
