import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = theme.colors.primary || "#3B82F6";
const BACKGROUND_COLOR = "#F8FAFC";

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  pendingRestaurants: number;
  approvedRestaurants: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
}

// Modern Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

// Compact Info Card
const InfoCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoIconContainer, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={20} color={color} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Action Button Component
const ActionButton = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View
      style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}
    >
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, userData } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
    approvedRestaurants: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const usersSnapshot = await getCountFromServer(collection(db, "users"));
      const totalUsers = usersSnapshot.data().count;

      const restaurantsSnapshot = await getDocs(collection(db, "restaurants"));
      let totalRestaurants = 0;
      let pendingRestaurants = 0;
      let approvedRestaurants = 0;

      restaurantsSnapshot.forEach((doc) => {
        totalRestaurants++;
        const status = doc.data().status;
        if (status === "pending") pendingRestaurants++;
        if (status === "approved") approvedRestaurants++;
      });

      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      let totalBookings = 0;
      let confirmedBookings = 0;
      let totalRevenue = 0;
      let todayRevenue = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      bookingsSnapshot.forEach((doc) => {
        totalBookings++;
        const data = doc.data();

        if (data.status === "confirmed") confirmedBookings++;

        if (data.payment?.amount) {
          totalRevenue += data.payment.amount;

          const bookingDate = data.createdAt?.toDate();
          if (bookingDate && bookingDate >= today) {
            todayRevenue += data.payment.amount;
          }
        }
      });

      setStats({
        totalUsers,
        totalRestaurants,
        pendingRestaurants,
        approvedRestaurants,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        todayRevenue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      Alert.alert("Error", "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>
              {String(userData?.fullName || "Admin")}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {/* Revenue Section - Click to view detailed analytics */}
        <View style={styles.revenueSection}>
          <TouchableOpacity
            style={styles.revenueCard}
            onPress={() => router.push("/(admin)/revenue-analytics")}
            activeOpacity={0.8}
          >
            <View style={styles.revenueTop}>
              <View>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>
                  {formatCurrency(stats.totalRevenue)}
                </Text>
              </View>
              <View style={styles.revenueIcon}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={28}
                  color={PRIMARY_COLOR}
                />
              </View>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueBottom}>
              <View style={styles.todayContainer}>
                <MaterialIcons name="today" size={16} color="#64748B" />
                <Text style={styles.todayLabel}>Today</Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={styles.todayValue}>
                  {formatCurrency(stats.todayRevenue)}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#94A3B8"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="people"
              label="Users"
              value={String(stats.totalUsers)}
              color="#3B82F6"
              onPress={() => router.push("/(admin)/manage-users")}
            />
            <StatCard
              icon="restaurant"
              label="Restaurants"
              value={String(stats.totalRestaurants)}
              color="#10B981"
              onPress={() => router.push("/(admin)/manage-restaurants")}
            />
            <StatCard
              icon="pending-actions"
              label="Pending"
              value={String(stats.pendingRestaurants)}
              color="#F59E0B"
              onPress={() => router.push("/(admin)/pending-approvals")}
            />
            <StatCard
              icon="check-circle"
              label="Approved"
              value={String(stats.approvedRestaurants)}
              color="#8B5CF6"
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          <View style={styles.infoRow}>
            <InfoCard
              icon="event"
              label="Total"
              value={String(stats.totalBookings)}
              color="#8B5CF6"
            />
            <InfoCard
              icon="event-available"
              label="Confirmed"
              value={String(stats.confirmedBookings)}
              color="#10B981"
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <ActionButton
            icon="pending-actions"
            title="Pending Approvals"
            subtitle={`${stats.pendingRestaurants} restaurants awaiting review`}
            color="#F59E0B"
            onPress={() => router.push("/(admin)/pending-approvals")}
          />

          <ActionButton
            icon="people"
            title="Manage Users"
            subtitle={`${stats.totalUsers} registered users`}
            color="#3B82F6"
            onPress={() => router.push("/(admin)/manage-users")}
          />

          <ActionButton
            icon="restaurant"
            title="All Restaurants"
            subtitle={`${stats.totalRestaurants} total listings`}
            color="#10B981"
            onPress={() => router.push("/(admin)/manage-restaurants")}
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  safeArea: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  revenueSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  revenueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  revenueLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "800",
    color: PRIMARY_COLOR,
  },
  revenueIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${PRIMARY_COLOR}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  revenueDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  revenueBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  todayValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});
