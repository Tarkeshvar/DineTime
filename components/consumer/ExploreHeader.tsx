import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { theme } from "../../constants/theme";

// Helper to separate the Locality (for the bold title) from the rest of the address (for the subtitle)
const formatHeaderLocation = (
  currentAddress: any,
  userLocation: string | null
) => {
  let locationString: string | null = null;

  if (currentAddress && currentAddress.address) {
    locationString = currentAddress.address;
  } else if (userLocation) {
    locationString = userLocation;
  }

  if (locationString) {
    const parts = locationString
      .split(",")
      .map((part) => part.trim())
      .filter((p) => p.length > 0);

    const primaryText = parts[0] || "Location Found";

    const secondaryText =
      parts.slice(1).join(", ") || "City, State/Region, Postal";

    return { primaryText, secondaryText };
  }

  return {
    primaryText: "Select Location",
    secondaryText: "Tap to set  address",
  };
};

export default function ExploreHeader() {
  const router = useRouter();
  const { userData } = useAuth();
  const {
    currentAddress,
    userLocation,
    loading: locationLoading,
  } = useLocation();

  const { primaryText, secondaryText } = formatHeaderLocation(
    currentAddress,
    userLocation
  );

  const mainDisplayLabel = locationLoading ? "Locating..." : primaryText;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        {/* Left - Location Block (Takes up available space, pushing profile right) */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => router.push("/(consumer)/location-selector")}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="location-on"
            size={22}
            color={theme.colors.primary}
          />
          <View style={styles.locationTextContainer}>
            {/* 1. TOP ROW: The BOLD Locality Text + Arrow */}
            <View style={styles.labelRow}>
              <Text style={styles.locationLabel} numberOfLines={1}>
                {mainDisplayLabel}
              </Text>

              <MaterialIcons
                name="keyboard-arrow-down"
                size={18}
                color={theme.colors.text}
              />
            </View>

            {/* 2. BOTTOM ROW: The smaller address detail text */}
            <Text style={styles.locationText} numberOfLines={1}>
              {secondaryText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right - Profile Icon (Fixed width, ensures space on the right) */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(consumer)/profile-menu")}
          activeOpacity={0.7}
        >
          {userData?.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileIconContainer}>
              <MaterialIcons
                name="person"
                size={22}
                color={theme.colors.primary}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // Kept standard horizontal padding
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.md,

    marginTop: 30,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
    gap: 8,
    marginLeft: 2,
  },
  locationTextContainer: {
    flex: 1,

    paddingRight: 15,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationLabel: {
    // DECREASED SIZE: lg (18) -> md (16)
    fontSize: 17,
    fontWeight: "900",
    color: theme.colors.text,
    marginRight: 4,
    // Ensure this text is prioritized but can truncate if needed
    flexShrink: 1,
  },

  locationText: {
    // DECREASED SIZE: sm (14) -> xs (12)
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1, // Ensures this text takes up space and truncates
  },

  // --- Profile Icon Styles (kept compact) ---
  profileButton: {
    marginLeft: 120,
    // Explicitly giving the button a fixed width/padding helps define the boundary
    // for the location block (flex: 1).
  },
  profileIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
