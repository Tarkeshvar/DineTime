import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

interface GuestSelectorProps {
  numberOfGuests: number;
  onGuestsChange: (guests: number) => void;
  maxGuests: number;
}

export default function GuestSelector({
  numberOfGuests,
  onGuestsChange,
  maxGuests,
}: GuestSelectorProps) {
  const handleIncrement = () => {
    if (numberOfGuests < maxGuests) {
      onGuestsChange(numberOfGuests + 1);
    }
  };

  const handleDecrement = () => {
    if (numberOfGuests > 1) {
      onGuestsChange(numberOfGuests - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.label}>Number of Guests</Text>
          <Text style={styles.sublabel}>Maximum {maxGuests} guests</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.button,
              numberOfGuests === 1 && styles.buttonDisabled,
            ]}
            onPress={handleDecrement}
            disabled={numberOfGuests === 1}
          >
            <MaterialIcons
              name="remove"
              size={24}
              color={
                numberOfGuests === 1
                  ? theme.colors.textSecondary
                  : theme.colors.primary
              }
            />
          </TouchableOpacity>

          <View style={styles.countContainer}>
            <Text style={styles.countText}>{numberOfGuests}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              numberOfGuests === maxGuests && styles.buttonDisabled,
            ]}
            onPress={handleIncrement}
            disabled={numberOfGuests === maxGuests}
          >
            <MaterialIcons
              name="add"
              size={24}
              color={
                numberOfGuests === maxGuests
                  ? theme.colors.textSecondary
                  : theme.colors.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  sublabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`, // ✅ fixed interpolation
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },
  countContainer: {
    minWidth: 40,
    alignItems: "center",
  },
  countText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
});
