import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { User } from "../../types";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function ManageUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const usersList: User[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        usersList.push({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as User);
      });

      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleBanUser = async (user: User) => {
    Alert.alert(
      "Ban User",
      `Are you sure you want to ban ${user.fullName}? They will not be able to access the app.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Ban",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "users", user.uid), {
                isBanned: true,
                updatedAt: new Date(),
              });
              Alert.alert("Success", "User has been banned");
              loadUsers();
            } catch (error) {
              console.error("Error banning user:", error);
              Alert.alert("Error", "Failed to ban user");
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Not Implemented",
              "User deletion requires Firebase Admin SDK"
            );
          },
        },
      ]
    );
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "owner":
        return "store";
      case "both":
        return "people";
      default:
        return "restaurant-menu";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return "Restaurant Owner";
      case "both":
        return "Owner & Consumer";
      default:
        return "Consumer";
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.fullName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>

        <View style={styles.userMainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullName}
            </Text>
            {item.isAdmin && (
              <View style={styles.adminBadge}>
                <MaterialIcons name="verified" size={12} color="#8B5CF6" />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
          <View style={styles.roleBadge}>
            <MaterialIcons
              name={getRoleIcon(item.rolePreference)}
              size={14}
              color="#3B82F6"
            />
            <Text style={styles.roleText}>
              {getRoleLabel(item.rolePreference)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <InfoRow icon="email" text={item.email} />
        <InfoRow icon="phone" text={item.phoneNumber || "No phone number"} />
        {item.location && (
          <InfoRow icon="location-on" text={item.location.split(",")[0]} />
        )}
      </View>

      {item.ownedRestaurants?.length || item.bookingHistory?.length ? (
        <View style={styles.statsSection}>
          {item.ownedRestaurants && item.ownedRestaurants.length > 0 && (
            <StatItem
              icon="store"
              value={item.ownedRestaurants.length}
              label="Restaurants"
            />
          )}
          {item.bookingHistory && item.bookingHistory.length > 0 && (
            <StatItem
              icon="event"
              value={item.bookingHistory.length}
              label="Bookings"
            />
          )}
        </View>
      ) : null}

      {!item.isAdmin && (
        <>
          <View style={styles.divider} />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.banButton}
              onPress={() => handleBanUser(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="block" size={20} color="#F59E0B" />
              <Text style={styles.banText}>Ban User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={20} color="#EF4444" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="people-outline" size={64} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No Users Found" : "No Users Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No results for "${searchQuery}"`
          : "User accounts will appear here"}
      </Text>
    </View>
  );

  const getCounts = () => ({
    total: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    owners: users.filter((u) => u.rolePreference === "owner").length,
    consumers: users.filter((u) => u.rolePreference === "consumer").length,
  });

  const counts = getCounts();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Manage Users</Text>
            <Text style={styles.headerSubtitle}>
              {counts.total} total users • {counts.admins} admins
            </Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.uid}
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

const InfoRow = ({
  icon,
  text,
}: {
  icon: "email" | "phone" | "location-on";
  text: string;
}) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={16} color="#64748B" />
    <Text style={styles.infoText} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

const StatItem = ({
  icon,
  value,
  label,
}: {
  icon: "store" | "event";
  value: number;
  label: string;
}) => (
  <View style={styles.statItem}>
    <MaterialIcons name={icon} size={18} color="#3B82F6" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
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
  userCard: {
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
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userMainInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  adminText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  infoRow: {
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
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  banButton: {
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
  banText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
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
