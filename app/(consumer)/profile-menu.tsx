import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  Image, 
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.85;

export default function ProfileMenu() {
  const router = useRouter();
  // Assuming updateUserProfile exists in useAuth for role switching
  const { userData, logout, updateUserProfile } = useAuth();
  const slideAnim = useRef(new Animated.Value(width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeDrawer = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) {
        callback();
      } else {
        router.replace("/(consumer)/explore");
      }
    });
  };

  const navigateAndClose = (path: string) => {
    closeDrawer(() => {
      setTimeout(() => router.push(path), 300);
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/landing");
        },
      },
    ]);
  };

  const handleRoleSwitch = () => {
    const newRole =
      userData?.rolePreference === "consumer" ? "owner" : "consumer";

    Alert.alert(
      "Switch Role",
      `Are you sure you want to switch to the ${newRole.toUpperCase()} role?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          style: "default",
          onPress: async () => {
            closeDrawer();

            if (updateUserProfile) {
              await updateUserProfile({ rolePreference: newRole });
            }

            const path =
              newRole === "owner"
                ? "/(owner)/my-restaurants"
                : "/(consumer)/explore";
            setTimeout(() => router.replace(path), 300);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => closeDrawer()}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.drawerContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {userData?.profileImage ? (
                <Image
                  source={{ uri: userData.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileIconPlaceholder}>
                  <Text style={styles.profileInitials}>
                    {userData?.fullName?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{userData?.fullName}</Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => navigateAndClose("/(consumer)/profile")}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <DrawerMenuItem
              icon="event"
              title="My Bookings"
              onPress={() => navigateAndClose("/(consumer)/bookings")}
            />

            <DrawerMenuItem
              icon="favorite-border"
              title="Favorites"
              badge={0}
              onPress={() => {
                // TODO
              }}
            />

            <DrawerMenuItem
              icon="location-on"
              title="Saved Addresses"
              onPress={() => navigateAndClose("/(consumer)/location-selector")}
            />

            <DrawerMenuItem
              icon="payment"
              title="Payment Methods"
              onPress={() => {
                // TODO
              }}
            />

            {(userData?.rolePreference === "owner" ||
              userData?.rolePreference === "both") && (
              <>
                <View style={styles.divider} />
                <DrawerMenuItem
                  icon="store"
                  title="My Restaurants"
                  highlight
                  onPress={() => navigateAndClose("/(owner)/my-restaurants")}
                />
              </>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>

            <DrawerMenuItem
              icon="notifications-none"
              title="Notifications"
              onPress={() => {
                // TODO
              }}
            />

            <DrawerMenuItem
              icon="help-outline"
              title="Help & Support"
              onPress={() => {
                // TODO
              }}
            />

            <DrawerMenuItem
              icon="info-outline"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => {
                // TODO
              }}
            />
          </View>

          {/* Role Switch Banner */}
          {userData?.rolePreference === "consumer" && (
            <View style={styles.roleSwitchBanner}>
              <MaterialIcons
                name="store"
                size={32}
                color={theme.colors.primary}
              />
              <View style={styles.roleSwitchText}>
                <Text style={styles.roleSwitchTitle}>List Your Restaurant</Text>
                <Text style={styles.roleSwitchSubtitle}>
                  Start receiving bookings from customers
                </Text>
              </View>
              <TouchableOpacity
                style={styles.roleSwitchButton}
                onPress={handleRoleSwitch}
              >
                <Text style={styles.roleSwitchButtonText}>Switch</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// Drawer Menu Item Component
const DrawerMenuItem = ({
  icon,
  title,
  subtitle,
  badge,
  highlight = false,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  badge?: number;
  highlight?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.menuItem, highlight && styles.menuItemHighlight]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialIcons
      name={icon}
      size={24}
      color={highlight ? theme.colors.primary : theme.colors.text}
    />
    <View style={styles.menuItemContent}>
      <Text
        style={[
          styles.menuItemTitle,
          highlight && styles.menuItemTitleHighlight,
        ]}
      >
        {title}
      </Text>
      {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
    </View>
    {badge !== undefined && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <MaterialIcons
      name="chevron-right"
      size={20}
      color={theme.colors.textSecondary}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerContent: {
    flex: 1,
  },
  profileHeader: {
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: "center",
  },
  profileImageContainer: {
    marginBottom: theme.spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewProfileText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  menuSection: {
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  menuItemHighlight: {
    backgroundColor: `${theme.colors.primary}08`,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  menuItemTitleHighlight: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  menuItemSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  roleSwitchBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  roleSwitchText: {
    flex: 1,
  },
  roleSwitchTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  roleSwitchSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  roleSwitchButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  roleSwitchButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center", // <-- FIX APPLIED HERE: corrected typo from 'aligntems'
    justifyContent: "center",
    marginHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.error}15`,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.error,
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.3)",
  },
  devButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: "#FF6B00",
  },
});
