import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { theme } from "../../../constants/theme";

export default function RegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleGetCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        setFetchingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        setStreet(addr.street || addr.name || "");
        setCity(addr.city || addr.subregion || "");
        setState(addr.region || "");
        setPincode(addr.postalCode || "");
      }

      Alert.alert("Success", "Location fetched successfully!");
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location");
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleContinue = () => {
    // Validation
    if (!street.trim()) {
      Alert.alert("Error", "Please enter street address");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Error", "Please enter city");
      return;
    }
    if (!state.trim()) {
      Alert.alert("Error", "Please enter state");
      return;
    }
    if (!pincode.trim()) {
      Alert.alert("Error", "Please enter pincode");
      return;
    }
    if (!coordinates) {
      Alert.alert("Error", "Please fetch location coordinates");
      return;
    }

    router.push({
      pathname: "/(owner)/register-restaurant/step3",
      params: {
        ...params,
        street,
        city,
        state,
        pincode,
        landmark,
        latitude: coordinates.latitude.toString(),
        longitude: coordinates.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add Restaurant</Text>
          <Text style={styles.headerSubtitle}>Step 2 of 5 - Location</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: "40%" }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Get Current Location Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleGetCurrentLocation}
            disabled={fetchingLocation}
          >
            <MaterialIcons
              name="my-location"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.locationButtonText}>
              <Text style={styles.locationButtonTitle}>
                {fetchingLocation ? "Fetching..." : "Use Current Location"}
              </Text>
              <Text style={styles.locationButtonSubtitle}>
                Get address from GPS
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Street Address */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Street Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street, Area Name"
            value={street}
            onChangeText={setStreet}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* City */}
        <View style={styles.section}>
          <Text style={styles.label}>
            City <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* State */}
        <View style={styles.section}>
          <Text style={styles.label}>
            State <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter state"
            value={state}
            onChangeText={setState}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Pincode */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Pincode <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Landmark (Optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Near City Mall"
            value={landmark}
            onChangeText={setLandmark}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Coordinates Display */}
        {coordinates && (
          <View style={styles.section}>
            <View style={styles.coordinatesCard}>
              <MaterialIcons
                name="location-on"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.coordinatesText}>
                <Text style={styles.coordinatesLabel}>Coordinates</Text>
                <Text style={styles.coordinatesValue}>
                  {coordinates.latitude.toFixed(6)},{" "}
                  {coordinates.longitude.toFixed(6)}
                </Text>
              </View>
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.surface,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  locationButtonText: {
    flex: 1,
  },
  locationButtonTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  locationButtonSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  coordinatesCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  coordinatesText: {
    flex: 1,
  },
  coordinatesLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  coordinatesValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  bottomBar: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
