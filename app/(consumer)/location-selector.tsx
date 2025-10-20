import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocation } from "../../contexts/LocationContext";
import { theme } from "../../constants/theme";

const getAddressCardTitle = (address: any) => {
  if (address.label && address.label.length > 0) {
    return address.label;
  }

  const parts = address.address.split(",").map((part: string) => part.trim());
  return parts[0] || "Saved Location";
};

export default function LocationSelector() {
  const router = useRouter();
  const {
    savedAddresses,
    currentAddress,
    setCurrentAddress,
    requestLocation,
    loading,
  } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAddress = (address: any) => {
    setCurrentAddress(address);
    router.back();
  };

  const handleUseCurrentLocation = async () => {
    if (savedAddresses.length >= 2) {
      Alert.alert(
        "Location Limit Reached",
        "You can only save 2 addresses. The oldest saved address will be replaced when a new location is set.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace Oldest",
            onPress: async () => {
              await requestLocation();
              router.back();
            },
          },
        ]
      );
    } else {
      await requestLocation();
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Select Your Location</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar (Modern Floating Card) */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={22}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for area, building, or street..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Location Section */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionHeaderTitle}>FIND LOCATION</Text>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.currentLocationIcon}>
                <MaterialIcons
                  name="my-location"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.currentLocationText}>
                <Text style={styles.currentLocationTitle}>
                  {loading ? "Detecting location..." : "Use Current Location"}
                </Text>
                <Text style={styles.currentLocationSubtitle}>
                  {currentAddress?.address ||
                    "Tap to detect your precise location via GPS"}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 ? (
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeaderTitle}>
                SAVED ADDRESSES ({savedAddresses.length}/2)
              </Text>
              {savedAddresses.map((address) => {
                const isActive = address.id === currentAddress?.id;
                return (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      isActive && styles.selectedAddressCard,
                    ]}
                    onPress={() => handleSelectAddress(address)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addressIconContainer}>
                      <MaterialIcons
                        name="location-on"
                        size={24}
                        color={
                          isActive
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                      />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text
                        style={[
                          styles.addressLabel,
                          isActive && { color: theme.colors.primary },
                        ]}
                      >
                        {getAddressCardTitle(address)}
                      </Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address.address}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.activeIndicator}>
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Empty State for Saved Addresses */
            <View style={styles.emptyState}>
              <MaterialIcons
                name="location-off"
                size={60}
                color={theme.colors.border}
              />
              <Text style={styles.emptyTitle}>No Saved Addresses</Text>
              <Text style={styles.emptySubtitle}>
                Use your current location or manually search for a place to get
                started.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet for Professional UI ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  // Modern Floating Search Card
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,

    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg, // Container padding for main content
  },
  cardSection: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm, // Subtle elevation for content blocks
  },
  sectionHeaderTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  // Current Location
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  currentLocationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  currentLocationSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Saved Addresses
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  selectedAddressCard: {
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.md,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  addressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  activeIndicator: {
    marginLeft: theme.spacing.sm,
  },

  emptyState: {
    alignItems: "center",
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
