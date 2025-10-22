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
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function PendingApprovalsScreen() {
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingRestaurants();
  }, []);

  const loadPendingRestaurants = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "restaurants"),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);
      const restaurantsList: Restaurant[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        restaurantsList.push({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Restaurant);
      });

      setRestaurants(restaurantsList);
    } catch (error) {
      console.error("Error loading pending restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingRestaurants();
  };

  const handleApprove = async (restaurant: Restaurant) => {
    Alert.alert(
      "Approve Restaurant",
      `Are you sure you want to approve "${restaurant.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            try {
              setProcessing(true);
              await updateDoc(doc(db, "restaurants", restaurant.id), {
                status: "approved",
                approvedAt: serverTimestamp(),
                approvedBy: user?.uid,
                updatedAt: serverTimestamp(),
              });

              Alert.alert("Success", "Restaurant approved successfully");
              loadPendingRestaurants();
            } catch (error) {
              console.error("Error approving restaurant:", error);
              Alert.alert("Error", "Failed to approve restaurant");
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a rejection reason");
      return;
    }

    if (!selectedRestaurant) return;

    try {
      setProcessing(true);
      await updateDoc(doc(db, "restaurants", selectedRestaurant.id), {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Restaurant rejected");
      setShowRejectModal(false);
      setSelectedRestaurant(null);
      setRejectionReason("");
      loadPendingRestaurants();
    } catch (error) {
      console.error("Error rejecting restaurant:", error);
      Alert.alert("Error", "Failed to reject restaurant");
    } finally {
      setProcessing(false);
    }
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images.coverImage }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.statusBadge}>
            <MaterialIcons name="schedule" size={14} color="#F59E0B" />
            <Text style={styles.statusText}>Pending Review</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.nameSection}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={styles.priceIndicator}>
            <Text style={styles.priceText}>{item.priceRange}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.infoSection}>
          <InfoItem
            icon="place"
            text={`${item.address.city}, ${item.address.state}`}
          />
          <InfoItem icon="phone" text={item.phone} />
          <InfoItem icon="person-outline" text={item.ownerName} />
          <InfoItem icon="event-seat" text={`${item.totalCapacity} seats`} />
        </View>

        <View style={styles.cuisineSection}>
          <Text style={styles.cuisineLabel}>Cuisines</Text>
          <View style={styles.cuisineList}>
            {item.cuisine.slice(0, 4).map((cuisine, index) => (
              <View key={index} style={styles.cuisineChip}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
            {item.cuisine.length > 4 && (
              <View style={styles.cuisineChip}>
                <Text style={styles.cuisineText}>
                  +{item.cuisine.length - 4}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item)}
            disabled={processing}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check-circle" size={22} color="#FFFFFF" />
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {
              setSelectedRestaurant(item);
              setShowRejectModal(true);
            }}
            disabled={processing}
            activeOpacity={0.8}
          >
            <MaterialIcons name="cancel" size={22} color="#FFFFFF" />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="check-circle-outline" size={64} color="#10B981" />
      </View>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptySubtitle}>
        No pending restaurant approvals at the moment.
      </Text>
      <Text style={styles.emptyHint}>
        New submissions will appear here for review.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Pending Approvals</Text>
            <Text style={styles.headerSubtitle}>
              Review and approve restaurant applications
            </Text>
          </View>
          {restaurants.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{restaurants.length}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading pending approvals...</Text>
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
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRejectModal(false);
          setSelectedRestaurant(null);
          setRejectionReason("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialIcons name="cancel" size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Reject Restaurant</Text>
              <Text style={styles.modalSubtitle}>
                Please provide a clear reason for rejection. This will help the
                restaurant owner understand what needs to be improved.
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Rejection Reason</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Incomplete documentation, invalid license..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={5}
                placeholderTextColor="#94A3B8"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setSelectedRestaurant(null);
                  setRejectionReason("");
                }}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  processing && styles.buttonDisabled,
                ]}
                onPress={handleRejectConfirm}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InfoItem = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.infoItem}>
    <MaterialIcons name={icon} size={16} color="#64748B" />
    <Text style={styles.infoText}>{text}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  headerContent: {
    flex: 1,
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
  countBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
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
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
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
    height: 200,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E2E8F0",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "space-between",
    padding: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },
  cardContent: {
    padding: 16,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 12,
  },
  priceIndicator: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    gap: 8,
    marginBottom: 16,
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
  },
  cuisineSection: {
    marginBottom: 16,
  },
  cuisineLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cuisineList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cuisineChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cuisineText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  approveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
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
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 440,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    minHeight: 120,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
