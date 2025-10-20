import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Restaurant, Booking } from "../../types";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

interface AnalyticsData {
  totalRestaurants: number;
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  averageBookingValue: number;
  totalGuests: number;
  topRestaurant: string;
  recentBookings: Booking[];
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRestaurants: 0,
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    averageBookingValue: 0,
    totalGuests: 0,
    topRestaurant: "N/A",
    recentBookings: [],
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get owner's restaurants
      const restaurantsQuery = query(
        collection(db, "restaurants"),
        where("ownerId", "==", user.uid)
      );
      const restaurantsSnapshot = await getDocs(restaurantsQuery);
      const restaurants: Restaurant[] = [];
      const restaurantIds: string[] = [];

      restaurantsSnapshot.forEach((doc) => {
        const data = doc.data();
        restaurants.push({
          ...data,
          id: doc.id,
        } as Restaurant);
        restaurantIds.push(doc.id);
      });

      if (restaurantIds.length === 0) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get bookings for owner's restaurants
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("restaurantId", "in", restaurantIds)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings: Booking[] = [];

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          ...data,
          id: doc.id,
          date: data.date?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
        } as Booking);
      });

      // Calculate analytics
      const totalRevenue = bookings.reduce(
        (sum, b) => sum + (b.payment?.amount || 0),
        0
      );
      const totalGuests = bookings.reduce(
        (sum, b) => sum + (b.numberOfGuests || 0),
        0
      );
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed"
      ).length;
      const cancelledBookings = bookings.filter(
        (b) => b.status === "cancelled"
      ).length;

      // Find top restaurant by bookings
      const restaurantBookingCounts = new Map<string, number>();
      bookings.forEach((booking) => {
        const count = restaurantBookingCounts.get(booking.restaurantName) || 0;
        restaurantBookingCounts.set(booking.restaurantName, count + 1);
      });

      let topRestaurant = "N/A";
      let maxBookings = 0;
      restaurantBookingCounts.forEach((count, name) => {
        if (count > maxBookings) {
          maxBookings = count;
          topRestaurant = name;
        }
      });

      // Get recent bookings (last 5)
      const recentBookings = bookings
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        )
        .slice(0, 5);

      setAnalytics({
        totalRestaurants: restaurants.length,
        totalBookings: bookings.length,
        totalRevenue,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        averageBookingValue:
          bookings.length > 0 ? totalRevenue / bookings.length : 0,
        totalGuests,
        topRestaurant,
        recentBookings,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your business insights</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="restaurant"
              label="Restaurants"
              value={String(analytics.totalRestaurants)}
              color="#FF6B6B"
            />
            <StatCard
              icon="event"
              label="Total Bookings"
              value={String(analytics.totalBookings)}
              color="#4ECDC4"
            />
            <StatCard
              icon="payments"
              label="Total Revenue"
              value={formatCurrency(analytics.totalRevenue)}
              color="#45B7D1"
            />
            <StatCard
              icon="people"
              label="Total Guests"
              value={String(analytics.totalGuests)}
              color="#96CEB4"
            />
          </View>
        </View>

        {/* Booking Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={styles.statusGrid}>
            <StatusCard
              icon="check-circle"
              label="Confirmed"
              value={String(analytics.confirmedBookings)}
              color="#10B981"
              percentage={
                analytics.totalBookings > 0
                  ? (
                      (analytics.confirmedBookings / analytics.totalBookings) *
                      100
                    ).toFixed(0)
                  : "0"
              }
            />
            <StatusCard
              icon="done-all"
              label="Completed"
              value={String(analytics.completedBookings)}
              color="#3B82F6"
              percentage={
                analytics.totalBookings > 0
                  ? (
                      (analytics.completedBookings / analytics.totalBookings) *
                      100
                    ).toFixed(0)
                  : "0"
              }
            />
            <StatusCard
              icon="cancel"
              label="Cancelled"
              value={String(analytics.cancelledBookings)}
              color="#EF4444"
              percentage={
                analytics.totalBookings > 0
                  ? (
                      (analytics.cancelledBookings / analytics.totalBookings) *
                      100
                    ).toFixed(0)
                  : "0"
              }
            />
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsCard}>
            <MetricRow
              icon="trending-up"
              label="Average Booking Value"
              value={formatCurrency(Math.round(analytics.averageBookingValue))}
            />
            <MetricRow
              icon="star"
              label="Top Restaurant"
              value={String(analytics.topRestaurant)}
            />
            <MetricRow
              icon="group"
              label="Avg. Party Size"
              value={
                analytics.totalBookings > 0
                  ? String(
                      (analytics.totalGuests / analytics.totalBookings).toFixed(
                        1
                      )
                    )
                  : "0"
              }
            />
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {analytics.recentBookings.length > 0 ? (
            <View style={styles.recentBookingsContainer}>
              {analytics.recentBookings.map((booking) => (
                <View key={booking.id} style={styles.recentBookingCard}>
                  <View style={styles.bookingLeft}>
                    <Text style={styles.bookingRestaurant} numberOfLines={1}>
                      {String(booking.restaurantName)}
                    </Text>
                    <Text style={styles.bookingUser}>
                      {String(booking.userName)} •{" "}
                      {String(booking.numberOfGuests)} guests
                    </Text>
                    <Text style={styles.bookingDate}>
                      {formatDate(booking.date)}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={styles.bookingAmount}>
                      {formatCurrency(booking.payment?.amount || 0)}
                    </Text>
                    <View
                      style={[
                        styles.bookingStatusBadge,
                        {
                          backgroundColor:
                            booking.status === "confirmed"
                              ? "#D1FAE5"
                              : booking.status === "completed"
                              ? "#DBEAFE"
                              : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bookingStatusText,
                          {
                            color:
                              booking.status === "confirmed"
                                ? "#059669"
                                : booking.status === "completed"
                                ? "#1D4ED8"
                                : "#DC2626",
                          },
                        ]}
                      >
                        {String(booking.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="event-busy"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyText}>No bookings yet</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({
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
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatusCard = ({
  icon,
  label,
  value,
  color,
  percentage,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  percentage: string;
}) => (
  <View style={styles.statusCard}>
    <MaterialIcons name={icon} size={28} color={color} />
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
    <Text style={styles.statusLabel}>{label}</Text>
    <Text style={styles.statusPercentage}>{percentage}%</Text>
  </View>
);

const MetricRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.metricRow}>
    <View style={styles.metricLeft}>
      <MaterialIcons name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  statCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    backgroundColor: "#FFFFFF",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  statusGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: theme.spacing.xs,
  },
  statusLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statusPercentage: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.text,
  },
  metricsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  metricLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  metricLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
  },
  recentBookingsContainer: {
    gap: theme.spacing.sm,
  },
  recentBookingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingLeft: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  bookingRestaurant: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  bookingUser: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  bookingRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bookingAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  bookingStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
