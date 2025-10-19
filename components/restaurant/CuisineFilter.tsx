import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { theme } from "../../constants/theme";

interface CuisineFilterProps {
  cuisines: string[];
  selectedCuisine: string | null;
  onSelectCuisine: (cuisine: string | null) => void;
}

const POPULAR_CUISINES = [
  "All",
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Japanese",
  "Continental",
  "Fast Food",
  "Cafe",
];

export default function CuisineFilter({
  cuisines,
  selectedCuisine,
  onSelectCuisine,
}: CuisineFilterProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {POPULAR_CUISINES.map((cuisine) => {
          const isSelected =
            cuisine === "All" ? !selectedCuisine : selectedCuisine === cuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() =>
                onSelectCuisine(cuisine === "All" ? null : cuisine)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {cuisine}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
