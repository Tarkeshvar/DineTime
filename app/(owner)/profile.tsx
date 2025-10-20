import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";
export default function OwnerProfileScreen() {
  const router = useRouter();
  const { userData, logout, updateUserProfile } = useAuth();

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

  const handleSwitchToConsumer = () => {
    Alert.alert(
      "Switch to Consumer",
      "Do you want to switch to consumer mode to book restaurants? This will change your primary app view.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            try {
              if (updateUserProfile) {
                const newRole =
                  userData?.rolePreference === "both" ? "both" : "consumer";
                await updateUserProfile({ rolePreference: newRole });
              }
              router.replace("/(consumer)/explore");
            } catch (error) {
              console.error("Error switching role:", error);
              Alert.alert("Error", "Failed to switch role view.");
            }
          },
        },
      ]
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons
              name="person"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.name}>{userData?.fullName}</Text>
          <Text style={styles.email}>{userData?.email}</Text>
          <Text style={styles.phone}>{userData?.phoneNumber}</Text>
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="restaurant-menu"
            title="Book as Consumer"
            subtitle="Switch to booking mode"
            onPress={handleSwitchToConsumer}
          />
          <MenuItem
            icon="settings"
            title="Settings"
            subtitle="App preferences"
            onPress={() => {}}
          />
          <MenuItem
            icon="help"
            title="Help & Support"
            subtitle="Get assistance"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialIcons name={icon} size={24} color={theme.colors.text} />
    <View style={styles.menuItemText}>
      <Text style={styles.menuItemTitle}>{title}</Text>
      <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
    </View>
    <MaterialIcons
      name="chevron-right"
      size={24}
      color={theme.colors.textSecondary}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    alignItems: "center",
    padding: theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  phone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  menuSection: {
    paddingVertical: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
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
});
