import React, { createContext, useState, useContext, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

interface LocationContextType {
  location: Location.LocationObject | null;
  city: string | null;
  loading: boolean;
  hasAskedPermission: boolean;
  requestLocation: (type: "once" | "always") => Promise<void>;
  skipLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

const LOCATION_PERMISSION_KEY = "hasAskedLocationPermission";

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, updateUserProfile } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  // 🔹 Check AsyncStorage on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  // 🔹 Reset permission if user logs in without city
  useEffect(() => {
    if (user && !(user as any).city) {
      setHasAskedPermission(false);
      AsyncStorage.removeItem(LOCATION_PERMISSION_KEY);
    }
  }, [user]);

  const checkPermissionStatus = async () => {
    const asked = await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
    setHasAskedPermission(asked === "true");
  };

  const reverseGeocode = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const result = await Location.reverseGeocodeAsync(coords);
      if (result && result.length > 0) {
        const address = result[0];
        const cityName =
          address.city || address.subregion || address.region || "Unknown";
        return cityName;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const requestLocation = async (type: "once" | "always") => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show nearby restaurants."
        );
        await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "true");
        setHasAskedPermission(true);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      const cityName = await reverseGeocode(currentLocation.coords);
      setCity(cityName);

      if (user && cityName) {
        await updateUserProfile({ city: cityName });
      }

      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "true");
      setHasAskedPermission(true);

      if (type === "once") {
        console.log("📍 Location accessed once");
      } else {
        console.log("📍 Location permission granted (while using)");
      }
    } catch (error: any) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const skipLocation = async () => {
    await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "true");
    setHasAskedPermission(true);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        city,
        loading,
        hasAskedPermission,
        requestLocation,
        skipLocation,
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
