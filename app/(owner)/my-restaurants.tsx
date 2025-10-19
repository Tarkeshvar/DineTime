import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

export default function MyRestaurantsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, [user]);

  const loadRestaurants = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "restaurants"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const restaurantsList: Restaurant[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        restaurantsList.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
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

  const handleAddRestaurant = () => {
    router.push("/(owner)/register-restaurant/step1");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      case "suspended":
        return "#6B7280";
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => console.log("Edit restaurant:", item.id)}
    >
      <Image
        source={{
          uri:
            item?.images?.coverImage ||
            "https://via.placeholder.com/400x200.png?text=No+Image",
        }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {String(item.name || "Unnamed Restaurant")}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${getStatusColor(
                  item.status || "pending"
                )}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status || "pending") },
              ]}
            >
              {String(item.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.restaurantDetails}>
          {item.address?.city ? (
            <DetailItem icon="place" text={String(item.address.city)} />
          ) : null}

          {item.totalBookings !== undefined && item.totalBookings !== null ? (
            <DetailItem
              icon="event"
              text={`${String(item.totalBookings)} bookings`}
            />
          ) : null}

          {item.averageRating && item.averageRating > 0 ? (
            <DetailItem
              icon="star"
              text={String(item.averageRating.toFixed(1))}
              color="#F59E0B"
            />
          ) : null}
        </View>

        {item.status === "rejected" && item.rejectionReason ? (
          <View style={styles.rejectionNote}>
            <MaterialIcons name="info" size={16} color={theme.colors.error} />
            <Text style={styles.rejectionText} numberOfLines={2}>
              {String(item.rejectionReason)}
            </Text>
          </View>
        ) : null}

        <View style={styles.restaurantActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={18} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons
              name="bar-chart"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.actionButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="store"
        size={80}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyText}>No Restaurants Yet</Text>
      <Text style={styles.emptySubtext}>
        Add your first restaurant to start receiving bookings
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddRestaurant}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Restaurant</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Restaurants</Text>
          <Text style={styles.headerSubtitle}>
            {restaurants.length}{" "}
            {restaurants.length === 1 ? "restaurant" : "restaurants"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {restaurants.length > 0 ? (
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={handleAddRestaurant}
            >
              <MaterialIcons
                name="add"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
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

const DetailItem = ({
  icon,
  text,
  color,
}: {
  icon: any;
  text: string;
  color?: string;
}) => {
  if (!text || text === "undefined" || text === "null" || text.trim() === "") {
    return null;
  }

  return (
    <View style={styles.detailItem}>
      <MaterialIcons
        name={icon}
        size={16}
        color={color || theme.colors.textSecondary}
      />
      <Text style={styles.detailText}>{String(text)}</Text>
    </View>
  );
};

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
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.error}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.surface,
  },
  restaurantInfo: {
    padding: theme.spacing.md,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  restaurantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  restaurantDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rejectionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.error}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  rejectionText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    lineHeight: 18,
  },
  restaurantActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
  },
  actionButtonText: {
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
    marginBottom: theme.spacing.xl,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
