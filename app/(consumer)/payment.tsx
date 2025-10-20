import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, userData } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  const restaurantId = params.restaurantId as string;
  const restaurantName = params.restaurantName as string;
  const date = new Date(params.date as string);
  const timeSlot = params.timeSlot as string;
  const numberOfGuests = parseInt(params.numberOfGuests as string);
  const tableIds = (params.tableIds as string).split(",");
  const specialRequests = params.specialRequests as string;
  const occasion = params.occasion as string;
  const amount = parseInt(params.amount as string);

  const isFreeBooking = amount === 0;

  const handlePayment = async () => {
    if (!isFreeBooking && !selectedPaymentMethod) {
      Alert.alert(
        "Select Payment Method",
        "Please select a payment method to continue"
      );
      return;
    }

    setProcessing(true);

    try {
      // For free bookings, directly create booking
      if (isFreeBooking) {
        await createBooking("free", "FREE_BOOKING");
        return;
      }

      // For paid bookings - integrate payment gateway
      // TODO: Integrate Stripe or Razorpay here

      // Simulating payment for now
      Alert.alert(
        "Payment Gateway",
        "Payment gateway integration coming soon. Creating booking...",
        [
          {
            text: "OK",
            onPress: async () => {
              await createBooking("success", "MOCK_PAYMENT_ID");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  const createBooking = async (paymentStatus: string, paymentId: string) => {
    try {
      const bookingData = {
        restaurantId,
        restaurantName,
        restaurantAddress: "", // TODO: Get from restaurant
        restaurantPhone: "", // TODO: Get from restaurant
        userId: user?.uid,
        userName: userData?.fullName,
        userPhone: userData?.phoneNumber,
        userEmail: userData?.email,
        date: date,
        timeSlot,
        numberOfGuests,
        tableIds,
        status: "confirmed",
        payment: {
          amount,
          perPersonFee: amount / numberOfGuests,
          totalGuests: numberOfGuests,
          currency: "INR",
          paymentIntentId: paymentId,
          status: paymentStatus,
          paidAt: serverTimestamp(),
          method: selectedPaymentMethod || "free",
        },
        specialRequests: specialRequests || null,
        occasion: occasion || null,
        isNonRefundable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      // Update restaurant total bookings
      await updateDoc(doc(db, "restaurants", restaurantId), {
        totalBookings: increment(1),
      });

      // Update user booking history
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          bookingHistory: increment(1),
        });
      }

      setProcessing(false);

      // Navigate to success screen
      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your table has been booked at ${restaurantName}`,
        [
          {
            text: "View Booking",
            onPress: () => {
              router.replace("/(consumer)/bookings");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to create booking. Please contact support.");
      setProcessing(false);
    }
  };

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
        <Text style={styles.headerTitle}>
          {isFreeBooking ? "Confirm Booking" : "Payment"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryCard}>
            <SummaryRow
              icon="store"
              label="Restaurant"
              value={restaurantName}
            />
            <SummaryRow
              icon="event"
              label="Date"
              value={date.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
            <SummaryRow icon="schedule" label="Time" value={timeSlot} />
            <SummaryRow
              icon="people"
              label="Guests"
              value={`${numberOfGuests} people`}
            />
            <SummaryRow
              icon="table-restaurant"
              label="Tables"
              value={`${tableIds.length} tables`}
            />
          </View>
        </View>

        {/* Payment Method Selection (Only for paid bookings) */}
        {!isFreeBooking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <View style={styles.paymentMethods}>
              <PaymentMethodCard
                icon="credit-card"
                title="Card"
                subtitle="Credit / Debit Card"
                selected={selectedPaymentMethod === "card"}
                onPress={() => setSelectedPaymentMethod("card")}
              />
              <PaymentMethodCard
                icon="account-balance-wallet"
                title="UPI"
                subtitle="Google Pay, PhonePe, etc."
                selected={selectedPaymentMethod === "upi"}
                onPress={() => setSelectedPaymentMethod("upi")}
              />
              <PaymentMethodCard
                icon="account-balance"
                title="Net Banking"
                subtitle="All major banks"
                selected={selectedPaymentMethod === "netbanking"}
                onPress={() => setSelectedPaymentMethod("netbanking")}
              />
            </View>
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <PriceRow
              label={`Booking Fee (${numberOfGuests} guests)`}
              value={isFreeBooking ? "FREE" : `₹${amount}`}
              isFree={isFreeBooking}
            />
            <View style={styles.priceDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              {isFreeBooking ? (
                <Text style={styles.totalValueFree}>FREE</Text>
              ) : (
                <Text style={styles.totalValue}>₹{amount}</Text>
              )}
            </View>
            <Text style={styles.nonRefundableNote}>
              ⚠️ This booking is non-refundable
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>Total</Text>
          {isFreeBooking ? (
            <Text style={styles.bottomBarValueFree}>FREE</Text>
          ) : (
            <Text style={styles.bottomBarValue}>₹{amount}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={processing}
        >
          <LinearGradient
            colors={[theme.colors.primary, "#FF8E53"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButtonGradient}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="verified" size={20} color="#FFFFFF" />
                <Text style={styles.payButtonText}>
                  {isFreeBooking ? "Confirm Booking" : "Pay Now"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

// Payment Method Card Component
const PaymentMethodCard = ({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.paymentCard, selected && styles.paymentCardSelected]}
    onPress={onPress}
  >
    <MaterialIcons
      name={icon}
      size={32}
      color={selected ? theme.colors.primary : theme.colors.textSecondary}
    />
    <View style={styles.paymentCardText}>
      <Text
        style={[
          styles.paymentCardTitle,
          selected && styles.paymentCardTitleSelected,
        ]}
      >
        {title}
      </Text>
      <Text style={styles.paymentCardSubtitle}>{subtitle}</Text>
    </View>
    {selected && (
      <MaterialIcons
        name="check-circle"
        size={24}
        color={theme.colors.primary}
      />
    )}
  </TouchableOpacity>
);

// Price Row Component
const PriceRow = ({
  label,
  value,
  isFree,
}: {
  label: string;
  value: string;
  isFree?: boolean;
}) => (
  <View style={styles.priceRow}>
    <Text style={styles.priceLabel}>{label}</Text>
    <Text style={[styles.priceValue, isFree && styles.priceValueFree]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 8,
    borderBottomColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
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
  },
  paymentMethods: {
    gap: theme.spacing.sm,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
    gap: theme.spacing.md,
  },
  paymentCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  paymentCardText: {
    flex: 1,
  },
  paymentCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentCardTitleSelected: {
    color: theme.colors.primary,
  },
  paymentCardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  priceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  priceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  priceValueFree: {
    color: "#10B981",
    fontWeight: "700",
  },
  priceDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  totalValueFree: {
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
  payButton: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  payButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
