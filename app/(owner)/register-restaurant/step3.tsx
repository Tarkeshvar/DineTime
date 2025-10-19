import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_SLOTS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "23:59",
];

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export default function RegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [hours, setHours] = useState<Record<string, DayHours>>({
    monday: { open: "09:00", close: "22:00", closed: false },
    tuesday: { open: "09:00", close: "22:00", closed: false },
    wednesday: { open: "09:00", close: "22:00", closed: false },
    thursday: { open: "09:00", close: "22:00", closed: false },
    friday: { open: "09:00", close: "23:00", closed: false },
    saturday: { open: "09:00", close: "23:00", closed: false },
    sunday: { open: "10:00", close: "22:00", closed: false },
  });

  const [showTimePicker, setShowTimePicker] = useState<{
    day: string;
    type: "open" | "close";
  } | null>(null);

  const toggleClosed = (day: string) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        closed: !hours[day].closed,
      },
    });
  };

  const setTime = (day: string, type: "open" | "close", time: string) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        [type]: time,
      },
    });
    setShowTimePicker(null);
  };

  const handleContinue = () => {
    // Check if at least one day is open
    const hasOpenDay = Object.values(hours).some((h) => !h.closed);
    if (!hasOpenDay) {
      Alert.alert("Error", "At least one day must be open");
      return;
    }

    // Validate open/close times for open days
    for (const day of DAYS) {
      const dayHours = hours[day];
      if (!dayHours.closed) {
        if (dayHours.open >= dayHours.close) {
          Alert.alert(
            "Invalid Hours",
            `${
              day.charAt(0).toUpperCase() + day.slice(1)
            }: Opening time must be before closing time`
          );
          return;
        }
      }
    }

    router.push({
      pathname: "/(owner)/register-restaurant/step4",
      params: {
        ...params,
        operatingHours: JSON.stringify(hours),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Add Restaurant</Text>
          <Text style={styles.headerSubtitle}>
            Step 3 of 5 - Operating Hours
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: "60%" }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <View style={styles.closedToggle}>
                <Text style={styles.closedLabel}>Closed</Text>
                <Switch
                  value={hours[day].closed}
                  onValueChange={() => toggleClosed(day)}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {!hours[day].closed && (
              <View style={styles.timeContainer}>
                {/* Opening Time */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker({ day, type: "open" })}
                >
                  <MaterialIcons
                    name="access-time"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.timeButtonText}>
                    <Text style={styles.timeButtonLabel}>Opens</Text>
                    <Text style={styles.timeButtonValue}>
                      {hours[day].open}
                    </Text>
                  </View>
                </TouchableOpacity>

                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />

                {/* Closing Time */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker({ day, type: "close" })}
                >
                  <MaterialIcons
                    name="access-time"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.timeButtonText}>
                    <Text style={styles.timeButtonLabel}>Closes</Text>
                    <Text style={styles.timeButtonValue}>
                      {hours[day].close}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.timePickerModal}>
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                Select {showTimePicker.type === "open" ? "Opening" : "Closing"}{" "}
                Time
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timePickerScroll}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.timeOption}
                  onPress={() =>
                    setTime(showTimePicker.day, showTimePicker.type, time)
                  }
                >
                  <Text style={styles.timeOptionText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.surface,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  dayCard: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  dayName: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  closedLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeButtonText: {
    flex: 1,
  },
  timeButtonLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  timeButtonValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  timePickerModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  timePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "70%",
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timePickerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  timePickerScroll: {
    maxHeight: 400,
  },
  timeOption: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: "center",
  },
  bottomBar: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
