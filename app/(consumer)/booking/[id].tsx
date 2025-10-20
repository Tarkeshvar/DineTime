import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Restaurant, Table } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";
import DateSelector from "../../../components/booking/DateSelector";
import TimeSlotSelector from "../../../components/booking/TimeSlotSelector";
import GuestSelector from "../../../components/booking/GuestSelector";
import TableSelector from "../../../components/booking/TableSelector";
import { theme } from "../../../constants/theme";

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { userData } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [selectedTables, setSelectedTables] = useState<Table[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [occasion, setOccasion] = useState("");

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "restaurants", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setRestaurant({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Restaurant);
      }
    } catch (error) {
      console.error("Error loading restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleGuestsChange = (guests: number) => {
    setNumberOfGuests(guests);
    setSelectedTables([]); // Reset table selection when guests change
  };

  const handleTableSelect = (tables: Table[]) => {
    setSelectedTables(tables);
  };

  const calculateTotalAmount = () => {
    if (!restaurant) return 0;
    return restaurant.bookingFeePerPerson * numberOfGuests;
  };

  const canProceedToPayment = () => {
    return (
      selectedDate &&
      selectedTimeSlot &&
      numberOfGuests > 0 &&
      selectedTables.length > 0
    );
  };

  const handleProceedToPayment = () => {
    if (!canProceedToPayment()) {
      Alert.alert("Incomplete Booking", "Please complete all booking details");
      return;
    }

    // Navigate to payment screen
    router.push({
      pathname: "/(consumer)/payment",
      params: {
        restaurantId: restaurant?.id,
        restaurantName: restaurant?.name,
        date: selectedDate?.toISOString(),
        timeSlot: selectedTimeSlot,
        numberOfGuests: numberOfGuests,
        tableIds: selectedTables.map((t) => t.tableId).join(","),
        specialRequests: specialRequests,
        occasion: occasion,
        amount: calculateTotalAmount(),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.errorText}>Restaurant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAmount = calculateTotalAmount();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Book a Table</Text>
          <Text style={styles.headerSubtitle}>{restaurant.name}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Date */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            restaurant={restaurant}
          />
        </View>

        {/* Step 2: Select Time Slot */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Select Time</Text>
            </View>
            <TimeSlotSelector
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={handleTimeSlotSelect}
              restaurant={restaurant}
            />
          </View>
        )}

        {/* Step 3: Number of Guests */}
        {selectedTimeSlot && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Number of Guests</Text>
            </View>
            <GuestSelector
              numberOfGuests={numberOfGuests}
              onGuestsChange={handleGuestsChange}
              maxGuests={restaurant.totalCapacity}
            />
          </View>
        )}

        {/* Step 4: Select Tables */}
        {numberOfGuests > 0 && selectedTimeSlot && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.sectionTitle}>Select Tables</Text>
            </View>
            <TableSelector
              tables={restaurant.tables}
              numberOfGuests={numberOfGuests}
              selectedTables={selectedTables}
              onTableSelect={handleTableSelect}
            />
          </View>
        )}

        {/* Step 5: Additional Details */}
        {selectedTables.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>5</Text>
              </View>
              <Text style={styles.sectionTitle}>
                Additional Details (Optional)
              </Text>
            </View>

            {/* Occasion */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Occasion</Text>
              <View style={styles.occasionButtons}>
                {["Birthday", "Anniversary", "Business", "Casual", "Other"].map(
                  (occ) => (
                    <TouchableOpacity
                      key={occ}
                      style={[
                        styles.occasionButton,
                        occasion === occ && styles.occasionButtonActive,
                      ]}
                      onPress={() => setOccasion(occ)}
                    >
                      <Text
                        style={[
                          styles.occasionButtonText,
                          occasion === occ && styles.occasionButtonTextActive,
                        ]}
                      >
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Special Requests */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Special Requests</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any dietary restrictions, seating preferences, etc."
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={4}
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        )}

        {/* Booking Summary */}
        {/* Booking Summary */}
        {canProceedToPayment() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              <SummaryRow
                icon="event"
                label="Date"
                value={
                  selectedDate
                    ? selectedDate.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""
                }
              />
              <SummaryRow
                icon="schedule"
                label="Time"
                value={selectedTimeSlot || ""}
              />
              <SummaryRow
                icon="people"
                label="Guests"
                value={`${numberOfGuests} ${
                  numberOfGuests === 1 ? "person" : "people"
                }`}
              />
              <SummaryRow
                icon="table-restaurant"
                label="Tables"
                value={
                  selectedTables.length > 0
                    ? selectedTables
                        .map((t) => `Table ${t.tableNumber}`)
                        .join(", ")
                    : ""
                }
              />
              {occasion && (
                <SummaryRow
                  icon="celebration"
                  label="Occasion"
                  value={occasion}
                />
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text
                  style={
                    totalAmount === 0
                      ? styles.summaryTotalValueFree
                      : styles.summaryTotalValue
                  }
                >
                  {totalAmount === 0 ? "FREE" : `₹${totalAmount}`}
                </Text>
              </View>

              <Text style={styles.nonRefundableNote}>
                ⚠️ This booking is non-refundable
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {canProceedToPayment() && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarLeft}>
            <Text style={styles.bottomBarLabel}>Total Amount</Text>
            {totalAmount === 0 ? (
              <Text style={styles.bottomBarValueFree}>FREE</Text>
            ) : (
              <Text style={styles.bottomBarValue}>₹{totalAmount}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToPayment}
            disabled={processing}
          >
            <LinearGradient
              colors={[theme.colors.primary, "#FF8E53"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedButtonGradient}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.proceedButtonText}>
                    {totalAmount === 0
                      ? "Confirm Booking"
                      : "Proceed to Payment"}
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Summary Row Component
const SummaryRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.summaryRow}>
    <View style={styles.summaryRowLeft}>
      <MaterialIcons name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 8,
    borderBottomColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  occasionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  occasionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  occasionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  occasionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.text,
  },
  occasionButtonTextActive: {
    color: "#FFFFFF",
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  summaryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "right",
    flex: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  summaryTotalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  summaryTotalValueFree: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: "#10B981",
  },
  nonRefundableNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  bottomBarValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  bottomBarValueFree: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: "#10B981",
  },
  proceedButton: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  proceedButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  proceedButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
