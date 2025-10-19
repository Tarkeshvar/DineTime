import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case "₹":
        return "#10B981";
      case "₹₹":
        return "#F59E0B";
      case "₹₹₹":
        return "#EF4444";
      case "₹₹₹₹":
        return "#8B5CF6";
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              restaurant?.images?.coverImage ||
              "https://via.placeholder.com/400x200",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Offer Badge (if any) */}
        {restaurant?.bookingFeePerPerson === 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>FREE BOOKING</Text>
          </View>
        )}

        {/* Rating Badge */}
        {!!restaurant?.averageRating && restaurant.averageRating > 0 && (
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={14} color="#FFFFFF" />
            <Text style={styles.ratingText}>
              {restaurant.averageRating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Restaurant Name */}
        <Text style={styles.name} numberOfLines={1}>
          {restaurant?.name || "Unnamed Restaurant"}
        </Text>

        {/* Cuisine Tags */}
        <View style={styles.cuisineContainer}>
          {restaurant?.cuisine?.slice(0, 3).map((cuisine, index) => (
            <View key={index} style={{ flexDirection: "row" }}>
              <Text style={styles.cuisineText}>{cuisine}</Text>
              {index < Math.min(restaurant?.cuisine?.length ?? 0, 3) - 1 && (
                <Text style={styles.cuisineText}> • </Text>
              )}
            </View>
          ))}
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <MaterialIcons
            name="place"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {restaurant?.address?.city || "Unknown City"},{" "}
            {restaurant?.address?.state || "Unknown State"}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Price Range */}
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.priceRange,
                { color: getPriceRangeColor(restaurant?.priceRange || "₹") },
              ]}
            >
              {restaurant?.priceRange || "₹"}
            </Text>
            <Text style={styles.priceLabel}>for two</Text>
          </View>

          {/* Booking Fee */}
          <View style={styles.bookingFeeContainer}>
            {restaurant?.bookingFeePerPerson === 0 ? (
              <Text style={styles.freeBooking}>Free</Text>
            ) : (
              <>
                <Text style={styles.bookingFee}>
                  ₹{restaurant?.bookingFeePerPerson ?? 0}
                </Text>
                <Text style={styles.bookingFeeLabel}>/person</Text>
              </>
            )}
          </View>
        </View>

        {/* Amenities */}
        {restaurant?.amenities && restaurant.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {restaurant.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface,
  },
  offerBadge: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: "#10B981",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offerText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ratingBadge: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
    alignItems: "center",
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
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.xs,
  },
  cuisineText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceRange: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
  },
  priceLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  bookingFeeContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bookingFee: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  bookingFeeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  freeBooking: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#10B981",
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  amenityTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
