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

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTimeSlot: string | null;
  onTimeSlotSelect: (timeSlot: string) => void;
  restaurant: Restaurant;
}

export default function TimeSlotSelector({
  selectedDate,
  selectedTimeSlot,
  onTimeSlotSelect,
  restaurant,
}: TimeSlotSelectorProps) {
  const generateTimeSlots = () => {
    const dayName = selectedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as keyof typeof restaurant.operatingHours;
    const hours = restaurant.operatingHours[dayName];

    if (hours.closed) return [];

    const slots: string[] = [];
    const [openHour, openMin] = hours.open.split(":").map(Number);
    const [closeHour, closeMin] = hours.close.split(":").map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMin < closeMin)
    ) {
      const startTime = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}`;

      // Add 2 hours for end time
      let endHour = currentHour + 2;
      let endMin = currentMin;

      const endTime = `${endHour.toString().padStart(2, "0")}:${endMin
        .toString()
        .padStart(2, "0")}`;

      slots.push(`${startTime} - ${endTime}`);

      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isPastTime = (timeSlot: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() > today.getTime()) return false;

    const [startTime] = timeSlot.split(" - ");
    const [hour, min] = startTime.split(":").map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hour, min, 0, 0);

    return slotTime <= now;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {timeSlots.map((slot, index) => {
          const isSelected = selectedTimeSlot === slot;
          const isPast = isPastTime(slot);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotCard,
                isSelected && styles.slotCardSelected,
                isPast && styles.slotCardDisabled,
              ]}
              onPress={() => !isPast && onTimeSlotSelect(slot)}
              disabled={isPast}
            >
              <Text
                style={[
                  styles.slotText,
                  isSelected && styles.slotTextSelected,
                  isPast && styles.slotTextDisabled,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  slotCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  slotCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotCardDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },
  slotText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
  },
  slotTextSelected: {
    color: "#FFFFFF",
  },
  slotTextDisabled: {
    color: theme.colors.textSecondary,
  },
});
