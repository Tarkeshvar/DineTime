import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Booking } from "../../types";
import { theme } from "../../constants/theme";

export default function OwnerManageBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "cancelled" | "completed"
  >("all");

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, get all restaurants owned by this user
      const restaurantsQuery = query(
        collection(db, "restaurants"),
        where("ownerId", "==", user.uid)
      );
      const restaurantsSnapshot = await getDocs(restaurantsQuery);
      const restaurantIds = restaurantsSnapshot.docs.map((doc) => doc.id);

      if (restaurantIds.length === 0) {
        setBookings([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get bookings for owner's restaurants
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("restaurantId", "in", restaurantIds),
        orderBy("createdAt", "desc")
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsList: Booking[] = [];

      bookingsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        bookingsList.push({
          ...data,
          id: docSnap.id,
          date: data.date?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          cancelledAt: data.cancelledAt?.toDate?.(),
          completedAt: data.completedAt?.toDate?.(),
          payment: {
            ...data.payment,
            paidAt: data.payment?.paidAt?.toDate?.(),
          },
        } as Booking);
      });

      setBookings(bookingsList);
    } catch (error) {
      console.error("Error loading bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleConfirmBooking = async (
    bookingId: string,
    restaurantName: string
  ) => {
    Alert.alert("Confirm Booking", `Confirm booking for ${restaurantName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), {
              status: "confirmed",
              updatedAt: new Date(),
            });
            Alert.alert("Success", "Booking confirmed");
            loadBookings();
          } catch (error) {
            console.error("Error confirming booking:", error);
            Alert.alert("Error", "Failed to confirm booking");
          }
        },
      },
    ]);
  };

  const handleCompleteBooking = async (bookingId: string) => {
    Alert.alert("Complete Booking", "Mark this booking as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), {
              status: "completed",
              completedAt: new Date(),
              updatedAt: new Date(),
            });
            Alert.alert("Success", "Booking marked as completed");
            loadBookings();
          } catch (error) {
            console.error("Error completing booking:", error);
            Alert.alert("Error", "Failed to complete booking");
          }
        },
      },
    ]);
  };

  const handleNoShow = async (bookingId: string) => {
    Alert.alert("Mark as No-Show", "Mark this booking as no-show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "No Show",
        style: "destructive",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), {
              status: "no-show",
              updatedAt: new Date(),
            });
            Alert.alert("Success", "Booking marked as no-show");
            loadBookings();
          } catch (error) {
            console.error("Error marking no-show:", error);
            Alert.alert("Error", "Failed to update booking");
          }
        },
      },
    ]);
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? The customer will be notified.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "bookings", bookingId), {
                status: "cancelled",
                cancelledAt: new Date(),
                cancelledBy: "restaurant",
                updatedAt: new Date(),
              });
              Alert.alert("Success", "Booking cancelled");
              loadBookings();
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      case "completed":
        return "#3B82F6";
      case "no-show":
        return "#6B7280";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "check-circle";
      case "cancelled":
        return "cancel";
      case "completed":
        return "done-all";
      case "no-show":
        return "warning";
      default:
        return "help";
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      {/* Header with Restaurant Name and Status */}
      <View style={styles.bookingHeader}>
        <View style={styles.restaurantInfo}>
          <MaterialIcons
            name="restaurant"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.restaurantName} numberOfLines={1}>
            {String(item.restaurantName || "Restaurant")}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <MaterialIcons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {String(item.status || "unknown").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons
            name="person"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.detailText}>
            {String(item.userName || "Guest")} (
            {String(item.numberOfGuests || 0)}{" "}
            {item.numberOfGuests === 1 ? "guest" : "guests"})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons
            name="phone"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.detailText}>
            {String(item.userPhone || "N/A")}
          </Text>
        </View>

        {item.userEmail ? (
          <View style={styles.detailRow}>
            <MaterialIcons
              name="email"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>{String(item.userEmail)}</Text>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <MaterialIcons
            name="calendar-today"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.detailText}>
            {formatDate(item.date)} • {String(item.timeSlot || "N/A")}
          </Text>
        </View>

        {item.tableIds && item.tableIds.length > 0 ? (
          <View style={styles.detailRow}>
            <MaterialIcons
              name="table-restaurant"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>
              Tables: {item.tableIds.map((t) => String(t)).join(", ")}
            </Text>
          </View>
        ) : null}

        {item.occasion ? (
          <View style={styles.detailRow}>
            <MaterialIcons
              name="celebration"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>
              Occasion: {String(item.occasion)}
            </Text>
          </View>
        ) : null}

        {item.specialRequests ? (
          <View style={styles.specialRequestsBox}>
            <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>
              {String(item.specialRequests)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Payment Info */}
      <View style={styles.paymentRow}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text
            style={[
              styles.paymentStatus,
              {
                color:
                  item.payment?.status === "success" ? "#10B981" : "#F59E0B",
              },
            ]}
          >
            {String(item.payment?.status || "pending").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.amountValue}>
          ₹{String(item.payment?.amount || 0)}
        </Text>
      </View>

      {/* Action Buttons */}
      {item.status === "confirmed" ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteBooking(item.id)}
          >
            <MaterialIcons name="done-all" size={18} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.noShowButton]}
            onPress={() => handleNoShow(item.id)}
          >
            <MaterialIcons name="warning" size={18} color="#6B7280" />
            <Text style={styles.noShowButtonText}>No Show</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <MaterialIcons name="close" size={18} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="event-busy"
        size={80}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyText}>No Bookings Yet</Text>
      <Text style={styles.emptySubtext}>
        Bookings for your restaurants will appear here
      </Text>
    </View>
  );

  const filteredBookings = getFilteredBookings();

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manage Bookings</Text>
          <Text style={styles.headerSubtitle}>
            {bookings.length} total bookings
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#10B981" }]}>
            {stats.confirmed}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#3B82F6" }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#EF4444" }]}>
            {stats.cancelled}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab
          label="All"
          count={stats.total}
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterTab
          label="Confirmed"
          count={stats.confirmed}
          active={filter === "confirmed"}
          onPress={() => setFilter("confirmed")}
        />
        <FilterTab
          label="Completed"
          count={stats.completed}
          active={filter === "completed"}
          onPress={() => setFilter("completed")}
        />
        <FilterTab
          label="Cancelled"
          count={stats.cancelled}
          active={filter === "cancelled"}
          onPress={() => setFilter("cancelled")}
        />
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const FilterTab = ({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.filterTab, active && styles.filterTabActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
      {label}
    </Text>
    <View
      style={[styles.filterCountBadge, active && styles.filterCountBadgeActive]}
    >
      <Text
        style={[styles.filterCountText, active && styles.filterCountTextActive]}
      >
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.text,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  filterCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
    minWidth: 20,
    alignItems: "center",
  },
  filterCountBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.text,
  },
  filterCountTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    flex: 1,
  },
  restaurantName: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  bookingDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  specialRequestsBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  specialRequestsLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  specialRequestsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontStyle: "italic",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  paymentLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  paymentStatus: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  amountValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  completeButton: {
    backgroundColor: "#3B82F6",
  },
  completeButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noShowButton: {
    backgroundColor: "#F3F4F6",
  },
  noShowButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#6B7280",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
  },
  cancelButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#EF4444",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
