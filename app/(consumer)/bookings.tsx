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
} from "react-native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import ExploreHeader from "../../components/consumer/ExploreHeader";
import { Booking } from "../../types";
import { theme } from "../../constants/theme";

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const bookingsList: Booking[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        bookingsList.push({
          ...data,
          id: doc.id,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          payment: {
            ...data.payment,
            paidAt: data.payment.paidAt?.toDate(),
          },
        } as Booking);
      });

      setBookings(bookingsList);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const filterBookings = () => {
    const now = new Date();
    if (activeTab === "upcoming") {
      return bookings.filter((b) => b.date >= now && b.status !== "cancelled");
    } else {
      return bookings.filter((b) => b.date < now || b.status === "cancelled");
    }
  };

  const filteredBookings = filterBookings();

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "confirmed" && styles.statusBadgeConfirmed,
            item.status === "cancelled" && styles.statusBadgeCancelled,
            item.status === "completed" && styles.statusBadgeCompleted,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "confirmed" && styles.statusTextConfirmed,
              item.status === "cancelled" && styles.statusTextCancelled,
              item.status === "completed" && styles.statusTextCompleted,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <DetailRow
          icon="event"
          text={item.date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
        <DetailRow icon="schedule" text={item.timeSlot} />
        <DetailRow icon="people" text={`${item.numberOfGuests} guests`} />
        <DetailRow
          icon="table-restaurant"
          text={`${item.tableIds.length} tables`}
        />
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.amountContainer}>
          {item.payment.amount === 0 ? (
            <Text style={styles.amountFree}>FREE</Text>
          ) : (
            <Text style={styles.amount}>₹{item.payment.amount}</Text>
          )}
          <Text style={styles.nonRefundable}>Non-refundable</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="event-busy"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyText}>No bookings found</Text>
      <Text style={styles.emptySubtext}>
        {activeTab === "upcoming"
          ? "Book a table to see it here"
          : "Your past bookings will appear here"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ExploreHeader />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.tabActive]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.tabTextActive,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

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

const DetailRow = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={16} color={theme.colors.textSecondary} />
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
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
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  restaurantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeConfirmed: {
    backgroundColor: "#D1FAE5",
  },
  statusBadgeCancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeCompleted: {
    backgroundColor: "#E0E7FF",
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  statusTextConfirmed: {
    color: "#059669",
  },
  statusTextCancelled: {
    color: "#DC2626",
  },
  statusTextCompleted: {
    color: "#4F46E5",
  },
  bookingDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  amountFree: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 2,
  },
  nonRefundable: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  detailsButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  detailsButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.primary,
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
