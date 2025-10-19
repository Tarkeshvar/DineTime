import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Restaurant } from "../../types";
import { theme } from "../../constants/theme";

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  restaurant: Restaurant;
}

export default function DateSelector({
  selectedDate,
  onDateSelect,
  restaurant,
}: DateSelectorProps) {
  // Generate next 14 days
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isDateClosed = (date: Date) => {
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as keyof typeof restaurant.operatingHours;
    return restaurant.operatingHours[dayName].closed;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {dates.map((date, index) => {
        const isSelected = isDateSelected(date);
        const isClosed = isDateClosed(date);
        const isToday = index === 0;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateCard,
              isSelected && styles.dateCardSelected,
              isClosed && styles.dateCardDisabled,
            ]}
            onPress={() => !isClosed && onDateSelect(date)}
            disabled={isClosed}
          >
            {isToday && <Text style={styles.todayLabel}>Today</Text>}
            <Text
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
                isClosed && styles.dayTextDisabled,
              ]}
            >
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </Text>
            <Text
              style={[
                styles.dateText,
                isSelected && styles.dateTextSelected,
                isClosed && styles.dateTextDisabled,
              ]}
            >
              {date.getDate()}
            </Text>
            {isClosed && <Text style={styles.closedText}>Closed</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  dateCard: {
    width: 70,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateCardDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },
  todayLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  dayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  dayTextDisabled: {
    color: theme.colors.textSecondary,
  },
  dateText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  dateTextSelected: {
    color: "#FFFFFF",
  },
  dateTextDisabled: {
    color: theme.colors.textSecondary,
  },
  closedText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: 4,
    fontWeight: "500",
  },
});
