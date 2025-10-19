import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocation } from "../../contexts/LocationContext";
import { restaurantService } from "../../services/restaurantService";
import LocationFetchingModal from "../../components/common/LocationFetchingModal";
import ExploreHeader from "../../components/consumer/ExploreHeader";
import SearchBar from "../../components/restaurant/SearchBar";
import CuisineFilter from "../../components/restaurant/CuisineFilter";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

export default function ExploreScreen() {
  const router = useRouter();
  const { loading: locationLoading } = useLocation();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    // Reload when cuisine filter changes
    if (selectedCuisine) {
      filterByCuisine(selectedCuisine);
    } else {
      loadRestaurants();
    }
  }, [selectedCuisine]);

  const loadRestaurants = async (loadMore: boolean = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }

      const {
        restaurants: newRestaurants,
        lastDoc: newLastDoc,
        hasMore: more,
      } = await restaurantService.getRestaurants(
        loadMore ? lastDoc : undefined
      );

      if (loadMore) {
        setRestaurants((prev) => [...prev, ...newRestaurants]);
      } else {
        setRestaurants(newRestaurants);
      }

      setLastDoc(newLastDoc);
      setHasMore(more);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterByCuisine = async (cuisine: string) => {
    try {
      setLoading(true);
      const filtered = await restaurantService.filterByCuisine(cuisine);
      setRestaurants(filtered);
      setHasMore(false);
    } catch (error) {
      console.error("Error filtering restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      try {
        setLoading(true);
        const results = await restaurantService.searchRestaurants(query);
        setRestaurants(results);
        setHasMore(false);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    } else if (query.trim().length === 0) {
      loadRestaurants();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedCuisine(null);
    setLastDoc(null);
    loadRestaurants();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !searchQuery && !selectedCuisine) {
      loadRestaurants(true);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/(consumer)/restaurant/${restaurant.id}`);
  };
  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>😕 No restaurants found</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery
            ? "Try a different search term"
            : "Check back later for new restaurants"}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || restaurants.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ExploreHeader />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={() => {
          // TODO: Open filter modal
          console.log("Filter pressed");
        }}
      />

      {/* Cuisine Filter */}
      <CuisineFilter
        cuisines={[]}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={setSelectedCuisine}
      />

      {/* Restaurant List */}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />

      {/* Location Fetching Modal */}
      <LocationFetchingModal visible={locationLoading} />

      {/* Initial Loading */}
      {loading && restaurants.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
