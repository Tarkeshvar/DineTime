import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Restaurant } from "../../../types";
import { theme } from "../../../constants/theme";

const { width, height } = Dimensions.get("window");

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
          approvedAt: data.approvedAt?.toDate(),
        } as Restaurant);
      }
    } catch (error) {
      console.error("Error loading restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const isOpenNow = () => {
    if (!restaurant) return false;
    const now = new Date();
    const dayName = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as keyof typeof restaurant.operatingHours;
    const todayHours = restaurant.operatingHours[dayName];

    if (todayHours.closed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleBookNow = () => {
    if (!restaurant) return;
    router.push(`/(consumer)/booking/${restaurant.id}`);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [
    restaurant.images.coverImage,
    ...restaurant.images.gallery,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(index);
          }}
        >
          {allImages.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Image Indicator */}
        {allImages.length > 1 ? (
          <View style={styles.imageIndicator}>
            {allImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === activeImageIndex && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        ) : null}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)"]}
            style={styles.backIconGradient}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)"]}
            style={styles.shareIconGradient}
          >
            <MaterialIcons name="share" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.imageGradient}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{String(restaurant.name)}</Text>
              {isOpenNow() ? (
                <View style={styles.openBadge}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>Open Now</Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rating & Reviews */}
          {restaurant.averageRating && restaurant.averageRating > 0 ? (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={18} color="#FFFFFF" />
                <Text style={styles.ratingText}>
                  {String(restaurant.averageRating.toFixed(1))}
                </Text>
              </View>
              <Text style={styles.reviewsText}>
                {String(restaurant.totalReviews)} reviews
              </Text>
            </View>
          ) : null}

          {/* Cuisine Tags */}
          <View style={styles.cuisineContainer}>
            {restaurant.cuisine.map((cuisine, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineTagText}>{String(cuisine)}</Text>
              </View>
            ))}
            {restaurant.priceRange ? (
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>
                  {String(restaurant.priceRange)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {restaurant.description ? (
            <Text style={styles.description}>
              {String(restaurant.description)}
            </Text>
          ) : null}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <MaterialIcons
              name="place"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.locationInfo}>
              {restaurant.address?.street ? (
                <Text style={styles.locationAddress}>
                  {String(restaurant.address.street)}
                </Text>
              ) : null}
              <Text style={styles.locationCity}>
                {String(restaurant.address?.city || "")}
                {restaurant.address?.state
                  ? `, ${String(restaurant.address.state)}`
                  : ""}
                {restaurant.address?.pincode
                  ? ` - ${String(restaurant.address.pincode)}`
                  : ""}
              </Text>
              {restaurant.address?.landmark ? (
                <Text style={styles.locationLandmark}>
                  Near {String(restaurant.address.landmark)}
                </Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity style={styles.directionsButton}>
            <MaterialIcons
              name="directions"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {restaurant.phone ? (
            <View style={styles.contactRow}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.contactText}>{String(restaurant.phone)}</Text>
            </View>
          ) : null}
          {restaurant.email ? (
            <View style={styles.contactRow}>
              <MaterialIcons
                name="email"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.contactText}>{String(restaurant.email)}</Text>
            </View>
          ) : null}
          {restaurant.website ? (
            <View style={styles.contactRow}>
              <MaterialIcons
                name="language"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.contactText}>
                {String(restaurant.website)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.dayText}>
                {String(day.charAt(0).toUpperCase() + day.slice(1))}
              </Text>
              {hours.closed ? (
                <Text style={styles.closedHoursText}>Closed</Text>
              ) : (
                <Text style={styles.hoursText}>
                  {String(hours.open)} - {String(hours.close)}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Amenities */}
        {restaurant.amenities && restaurant.amenities.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {restaurant.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.amenityText}>{String(amenity)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Features */}
        {restaurant.features && restaurant.features.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {restaurant.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{String(feature)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Booking Fee Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.bookingInfoCard}>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Booking Fee:</Text>
              {restaurant.bookingFeePerPerson === 0 ? (
                <Text style={styles.bookingInfoValueFree}>FREE</Text>
              ) : (
                <Text style={styles.bookingInfoValue}>
                  ₹{String(restaurant.bookingFeePerPerson)}/person
                </Text>
              )}
            </View>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Cancellation:</Text>
              <Text style={styles.bookingInfoValue}>Non-refundable</Text>
            </View>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Total Capacity:</Text>
              <Text style={styles.bookingInfoValue}>
                {String(restaurant.totalCapacity)} seats
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          {restaurant.bookingFeePerPerson === 0 ? (
            <Text style={styles.freePriceText}>Free Booking</Text>
          ) : (
            <>
              <Text style={styles.priceLabel}>Booking Fee</Text>
              <Text style={styles.priceValue}>
                ₹{String(restaurant.bookingFeePerPerson)}/person
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <LinearGradient
            colors={[theme.colors.primary, "#FF8E53"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  imageContainer: {
    width,
    height: height * 0.4,
    position: "relative",
  },
  image: {
    width,
    height: height * 0.4,
  },
  imageIndicator: {
    position: "absolute",
    bottom: theme.spacing.lg,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  indicatorDotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  backIconButton: {
    position: "absolute",
    top: 50,
    left: theme.spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
  },
  backIconGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    position: "absolute",
    top: 50,
    right: theme.spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
  },
  shareIconGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  openText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#059669",
  },
  closedBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#DC2626",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reviewsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  cuisineTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cuisineTagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "500",
  },
  priceTag: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceTagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  locationCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  locationCity: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  locationLandmark: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  directionsText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  dayText: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
    textTransform: "capitalize",
  },
  hoursText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  closedHoursText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    fontWeight: "500",
  },
  amenitiesGrid: {
    gap: theme.spacing.md,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  amenityText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  featureTag: {
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  bookingInfoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  bookingInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingInfoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  bookingInfoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  bookingInfoValueFree: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#10B981",
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
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  freePriceText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: "#10B981",
  },
  bookButton: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  bookButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
