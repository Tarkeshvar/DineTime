import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import LocationPermissionModal from "../../components/common/LocationPermissionModal";
import { theme } from "../../constants/theme";

export default function ExploreScreen() {
  const { userData } = useAuth();
  const { hasAskedPermission, requestLocation, skipLocation, loading, city } =
    useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Show location modal only if user hasn't been asked before
    if (!hasAskedPermission && !userData?.city) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAskedPermission, userData]);

  const handleAllowWhileUsing = async () => {
    await requestLocation("always");
    setShowLocationModal(false);
  };

  const handleAllowOnce = async () => {
    await requestLocation("once");
    setShowLocationModal(false);
  };

  const handleDontAllow = async () => {
    await skipLocation();
    setShowLocationModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.fullName}! 👋</Text>
          <View style={styles.locationRow}>
            <MaterialIcons
              name="location-on"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.locationText}>
              {city || userData?.city || "Location not set"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.comingSoon}>🍽️ Explore Screen - Coming Soon!</Text>

        {/* Show location info if available */}
        {city && (
          <View style={styles.infoCard}>
            <MaterialIcons
              name="check-circle"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.infoText}>Location enabled: {city}</Text>
          </View>
        )}

        {/* Manual location trigger (for testing) */}
        {!city && hasAskedPermission && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowLocationModal(true)}
          >
            <MaterialIcons
              name="location-on"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.retryButtonText}>Enable Location</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location Permission Modal */}
      <LocationPermissionModal
        visible={showLocationModal}
        loading={loading}
        onAllowWhileUsing={handleAllowWhileUsing}
        onAllowOnce={handleAllowOnce}
        onDontAllow={handleDontAllow}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  greeting: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  comingSoon: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.success}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  retryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});
