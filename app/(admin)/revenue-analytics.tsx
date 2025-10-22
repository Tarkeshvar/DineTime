import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

interface RestaurantRevenue {
  restaurantId: string;
  restaurantName: string;
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  totalGuests: number;
  lastBookingDate: Date | null;
}

export default function RevenueAnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantRevenues, setRestaurantRevenues] = useState<
    RestaurantRevenue[]
  >([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalRestaurants: 0,
    averageRevenuePerRestaurant: 0,
  });
  const [sortBy, setSortBy] = useState<"revenue" | "bookings">("revenue");

  // Add to dashboard revenue card - make it clickable
  // In your dashboard file, wrap the revenueCard in TouchableOpacity:
  // <TouchableOpacity onPress={() => router.push("/(admin)/revenue-analytics")}>
  //   <View style={styles.revenueCard}>...</View>
  // </TouchableOpacity>

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      // Get all restaurants
      const restaurantsSnapshot = await getDocs(collection(db, "restaurants"));
      const restaurantsMap = new Map<string, string>();

      restaurantsSnapshot.forEach((doc) => {
        restaurantsMap.set(doc.id, doc.data().name || "Unknown Restaurant");
      });

      // Get all bookings
      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      const revenueMap = new Map<string, RestaurantRevenue>();

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        const restaurantId = data.restaurantId;
        const restaurantName =
          data.restaurantName || restaurantsMap.get(restaurantId) || "Unknown";

        if (!revenueMap.has(restaurantId)) {
          revenueMap.set(restaurantId, {
            restaurantId,
            restaurantName,
            totalRevenue: 0,
            totalBookings: 0,
            confirmedBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            averageBookingValue: 0,
            totalGuests: 0,
            lastBookingDate: null,
          });
        }

        const restaurantData = revenueMap.get(restaurantId)!;
        restaurantData.totalBookings++;

        if (data.status === "confirmed") restaurantData.confirmedBookings++;
        if (data.status === "completed") restaurantData.completedBookings++;
        if (data.status === "cancelled") restaurantData.cancelledBookings++;

        if (data.payment?.amount) {
          restaurantData.totalRevenue += data.payment.amount;
        }

        if (data.numberOfGuests) {
          restaurantData.totalGuests += data.numberOfGuests;
        }

        const bookingDate = data.createdAt?.toDate();
        if (bookingDate) {
          if (
            !restaurantData.lastBookingDate ||
            bookingDate > restaurantData.lastBookingDate
          ) {
            restaurantData.lastBookingDate = bookingDate;
          }
        }
      });

      // Calculate averages and convert to array
      const revenueArray = Array.from(revenueMap.values()).map((r) => ({
        ...r,
        averageBookingValue:
          r.totalBookings > 0 ? r.totalRevenue / r.totalBookings : 0,
      }));

      // Sort by revenue (default)
      revenueArray.sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Calculate total stats
      const totalRevenue = revenueArray.reduce(
        (sum, r) => sum + r.totalRevenue,
        0
      );
      const totalBookings = revenueArray.reduce(
        (sum, r) => sum + r.totalBookings,
        0
      );

      setRestaurantRevenues(revenueArray);
      setTotalStats({
        totalRevenue,
        totalBookings,
        totalRestaurants: revenueArray.length,
        averageRevenuePerRestaurant:
          revenueArray.length > 0 ? totalRevenue / revenueArray.length : 0,
      });
    } catch (error) {
      console.error("Error loading revenue data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRevenueData();
  };

  const handleSort = (type: "revenue" | "bookings") => {
    setSortBy(type);
    const sorted = [...restaurantRevenues].sort((a, b) => {
      if (type === "revenue") {
        return b.totalRevenue - a.totalRevenue;
      } else {
        return b.totalBookings - a.totalBookings;
      }
    });
    setRestaurantRevenues(sorted);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRevenuePercentage = (revenue: number) => {
    if (totalStats.totalRevenue === 0) return 0;
    return ((revenue / totalStats.totalRevenue) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading revenue analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Revenue Analytics</Text>
            <Text style={styles.headerSubtitle}>Detailed breakdown</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={28}
                color="#3B82F6"
              />
            </View>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalStats.totalRevenue)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summarySmallCard}>
              <MaterialIcons name="restaurant" size={20} color="#10B981" />
              <Text style={styles.summarySmallValue}>
                {String(totalStats.totalRestaurants)}
              </Text>
              <Text style={styles.summarySmallLabel}>Restaurants</Text>
            </View>
            <View style={styles.summarySmallCard}>
              <MaterialIcons name="event" size={20} color="#8B5CF6" />
              <Text style={styles.summarySmallValue}>
                {String(totalStats.totalBookings)}
              </Text>
              <Text style={styles.summarySmallLabel}>Total Bookings</Text>
            </View>
          </View>

          <View style={styles.averageCard}>
            <MaterialIcons name="trending-up" size={20} color="#F59E0B" />
            <View style={styles.averageContent}>
              <Text style={styles.averageLabel}>Avg per Restaurant</Text>
              <Text style={styles.averageValue}>
                {formatCurrency(
                  Math.round(totalStats.averageRevenuePerRestaurant)
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sectionTitle}>Revenue by Restaurant</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "revenue" && styles.sortButtonActive,
              ]}
              onPress={() => handleSort("revenue")}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "revenue" && styles.sortButtonTextActive,
                ]}
              >
                By Revenue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "bookings" && styles.sortButtonActive,
              ]}
              onPress={() => handleSort("bookings")}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "bookings" && styles.sortButtonTextActive,
                ]}
              >
                By Bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Revenue List */}
        <View style={styles.listSection}>
          {restaurantRevenues.length > 0 ? (
            restaurantRevenues.map((restaurant, index) => (
              <View key={restaurant.restaurantId} style={styles.restaurantCard}>
                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>

                {/* Restaurant Header */}
                <View style={styles.restaurantHeader}>
                  <View style={styles.restaurantIconContainer}>
                    <MaterialIcons
                      name="restaurant"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.restaurantTitleContainer}>
                    <Text style={styles.restaurantName} numberOfLines={1}>
                      {String(restaurant.restaurantName)}
                    </Text>
                    <Text style={styles.restaurantId}>
                      ID: {String(restaurant.restaurantId.substring(0, 8))}...
                    </Text>
                  </View>
                </View>

                {/* Revenue Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Number(
                            getRevenuePercentage(restaurant.totalRevenue)
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getRevenuePercentage(restaurant.totalRevenue)}%
                  </Text>
                </View>

                {/* Revenue Amount */}
                <View style={styles.revenueAmount}>
                  <Text style={styles.revenueLabel}>Total Revenue</Text>
                  <Text style={styles.revenueValue}>
                    {formatCurrency(restaurant.totalRevenue)}
                  </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="event" size={16} color="#64748B" />
                    <Text style={styles.statValue}>
                      {String(restaurant.totalBookings)}
                    </Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="people" size={16} color="#64748B" />
                    <Text style={styles.statValue}>
                      {String(restaurant.totalGuests)}
                    </Text>
                    <Text style={styles.statLabel}>Guests</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons
                      name="attach-money"
                      size={16}
                      color="#64748B"
                    />
                    <Text style={styles.statValue}>
                      {formatCurrency(
                        Math.round(restaurant.averageBookingValue)
                      )}
                    </Text>
                    <Text style={styles.statLabel}>Avg Booking</Text>
                  </View>
                </View>

                {/* Status Breakdown */}
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#10B981" }]}
                    />
                    <Text style={styles.statusText}>
                      {String(restaurant.confirmedBookings)} Confirmed
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#3B82F6" }]}
                    />
                    <Text style={styles.statusText}>
                      {String(restaurant.completedBookings)} Completed
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#EF4444" }]}
                    />
                    <Text style={styles.statusText}>
                      {String(restaurant.cancelledBookings)} Cancelled
                    </Text>
                  </View>
                </View>

                {/* Last Booking */}
                <View style={styles.lastBooking}>
                  <MaterialIcons name="schedule" size={14} color="#94A3B8" />
                  <Text style={styles.lastBookingText}>
                    Last booking: {formatDate(restaurant.lastBookingDate)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No revenue data available</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  summarySection: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  summaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#3B82F6",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summarySmallCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summarySmallValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 4,
  },
  summarySmallLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  averageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  averageContent: {
    flex: 1,
  },
  averageLabel: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F59E0B",
  },
  sortSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
  },
  listSection: {
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B",
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  restaurantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantTitleContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 40,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  restaurantId: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "monospace",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    width: 40,
    textAlign: "right",
  },
  revenueAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  revenueLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  lastBooking: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  lastBookingText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 16,
  },
});
