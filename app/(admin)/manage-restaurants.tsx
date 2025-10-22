import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function ManageRestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "suspended"
  >("all");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "restaurants"));
      const restaurantsList: Restaurant[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        restaurantsList.push({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          approvedAt: data.approvedAt?.toDate?.(),
        } as Restaurant);
      });

      setRestaurants(restaurantsList);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const handleSuspend = async (restaurant: Restaurant) => {
    Alert.alert(
      "Suspend Restaurant",
      `Are you sure you want to suspend "${restaurant.name}"? It will be hidden from users.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Suspend",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "restaurants", restaurant.id), {
                status: "suspended",
                updatedAt: new Date(),
              });
              Alert.alert("Success", "Restaurant suspended");
              loadRestaurants();
            } catch (error) {
              console.error("Error suspending restaurant:", error);
              Alert.alert("Error", "Failed to suspend restaurant");
            }
          },
        },
      ]
    );
  };

  const handleUnsuspend = async (restaurant: Restaurant) => {
    Alert.alert(
      "Unsuspend Restaurant",
      `Are you sure you want to unsuspend "${restaurant.name}"? It will be visible to users again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsuspend",
          style: "default",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "restaurants", restaurant.id), {
                status: "approved",
                updatedAt: new Date(),
              });
              Alert.alert("Success", "Restaurant unsuspended and approved");
              loadRestaurants();
            } catch (error) {
              console.error("Error unsuspending restaurant:", error);
              Alert.alert("Error", "Failed to unsuspend restaurant");
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (restaurant: Restaurant) => {
    Alert.alert(
      "Delete Restaurant",
      `Are you sure you want to permanently delete "${restaurant.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "restaurants", restaurant.id));
              Alert.alert("Success", "Restaurant deleted");
              loadRestaurants();
            } catch (error) {
              console.error("Error deleting restaurant:", error);
              Alert.alert("Error", "Failed to delete restaurant");
            }
          },
        },
      ]
    );
  };

  const getFilteredRestaurants = () => {
    if (filter === "all") return restaurants;
    return restaurants.filter((r) => r.status === filter);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "#10B981",
          bg: "#D1FAE5",
          icon: "check-circle" as const,
        };
      case "pending":
        return { color: "#F59E0B", bg: "#FEF3C7", icon: "schedule" as const };
      case "rejected":
        return { color: "#EF4444", bg: "#FEE2E2", icon: "cancel" as const };
      case "suspended":
        return { color: "#6B7280", bg: "#F3F4F6", icon: "block" as const };
      default:
        return {
          color: "#64748B",
          bg: "#F1F5F9",
          icon: "help-outline" as const,
        };
    }
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => {
    const statusConfig = getStatusConfig(item.status || "pending");

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={
              item?.images?.coverImage
                ? { uri: item.images.coverImage }
                : require("../../assets/placeholder.jpg")
            }
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <MaterialIcons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {String(item.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {String(item.name || "Unnamed Restaurant")}
          </Text>

          <View style={styles.infoSection}>
            {item.ownerName?.trim() ? (
              <InfoItem icon="person-outline" text={String(item.ownerName)} />
            ) : null}
            {item.address?.city?.trim() ? (
              <InfoItem
                icon="place"
                text={`${String(item.address.city)}${
                  item.address.state ? ", " + String(item.address.state) : ""
                }`}
              />
            ) : null}
            {item.totalBookings !== undefined && item.totalBookings !== null ? (
              <InfoItem
                icon="event"
                text={`${String(item.totalBookings)} bookings`}
              />
            ) : null}
            {item.averageRating && item.averageRating > 0 ? (
              <InfoItem
                icon="star"
                text={`${String(item.averageRating.toFixed(1))} rating`}
                highlight
              />
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            {item.status === "suspended" ? (
              <TouchableOpacity
                style={styles.unsuspendButton}
                onPress={() => handleUnsuspend(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.unsuspendText}>Unsuspend</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.suspendButton}
                onPress={() => handleSuspend(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="block" size={20} color="#F59E0B" />
                <Text style={styles.suspendText}>Suspend</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={20} color="#EF4444" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="restaurant" size={64} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>No Restaurants Found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === "all"
          ? "No restaurants have been added yet"
          : `No ${filter} restaurants at the moment`}
      </Text>
    </View>
  );

  const filteredRestaurants = getFilteredRestaurants();

  const getStatusCounts = () => ({
    all: restaurants.length,
    approved: restaurants.filter((r) => r.status === "approved").length,
    pending: restaurants.filter((r) => r.status === "pending").length,
    rejected: restaurants.filter((r) => r.status === "rejected").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
  });

  const counts = getStatusCounts();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>All Restaurants</Text>
            <Text style={styles.headerSubtitle}>
              Manage and monitor all restaurant listings
            </Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Status</Text>
          <View style={styles.filterTabs}>
            <FilterChip
              label="All"
              count={counts.all}
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterChip
              label="Approved"
              count={counts.approved}
              active={filter === "approved"}
              onPress={() => setFilter("approved")}
              color="#10B981"
            />
            <FilterChip
              label="Pending"
              count={counts.pending}
              active={filter === "pending"}
              onPress={() => setFilter("pending")}
              color="#F59E0B"
            />
            <FilterChip
              label="Rejected"
              count={counts.rejected}
              active={filter === "rejected"}
              onPress={() => setFilter("rejected")}
              color="#EF4444"
            />
            <FilterChip
              label="Suspended"
              count={counts.suspended}
              active={filter === "suspended"}
              onPress={() => setFilter("suspended")}
              color="#6B7280"
            />
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const InfoItem = ({
  icon,
  text,
  highlight,
}: {
  icon: "person-outline" | "place" | "event" | "star";
  text: string;
  highlight?: boolean;
}) => {
  if (!text || text === "undefined" || text === "null" || text.trim() === "") {
    return null;
  }

  return (
    <View style={styles.infoItem}>
      <MaterialIcons
        name={icon}
        size={16}
        color={highlight ? "#F59E0B" : "#64748B"}
      />
      <Text style={[styles.infoText, highlight && styles.infoTextHighlight]}>
        {String(text)}
      </Text>
    </View>
  );
};

const FilterChip = ({
  label,
  count,
  active,
  onPress,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color?: string;
}) => {
  const bgColor = active ? color || "#3B82F6" : "#F1F5F9";
  const textColor = active ? "#FFFFFF" : "#475569";

  return (
    <TouchableOpacity
      style={[styles.filterChip, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipLabel, { color: textColor }]}>
        {label}
      </Text>
      <View
        style={[
          styles.filterChipBadge,
          { backgroundColor: active ? "rgba(255,255,255,0.25)" : "#E2E8F0" },
        ]}
      >
        <Text style={[styles.filterChipCount, { color: textColor }]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterChipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  filterChipCount: {
    fontSize: 11,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E2E8F0",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  infoSection: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  infoTextHighlight: {
    color: "#F59E0B",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  suspendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBEB",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  suspendText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
  },
  unsuspendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  unsuspendText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
