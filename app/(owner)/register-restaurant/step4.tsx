import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";

interface Table {
  tableId: string;
  tableNumber: string;
  capacity: number;
  location: "indoor" | "outdoor" | "private";
}

export default function RegisterStep4() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [tables, setTables] = useState<Table[]>([]);
  const [showAddTable, setShowAddTable] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [location, setLocation] = useState<"indoor" | "outdoor" | "private">(
    "indoor"
  );

  const handleAddTable = () => {
    if (!tableNumber.trim()) {
      Alert.alert("Error", "Please enter table number");
      return;
    }
    if (!capacity || parseInt(capacity) < 1) {
      Alert.alert("Error", "Please enter valid capacity");
      return;
    }

    // Prevent duplicate table number
    if (tables.some((t) => t.tableNumber === tableNumber.trim())) {
      Alert.alert("Error", "Table number already exists");
      return;
    }

    const newTable: Table = {
      tableId: `T${Date.now()}`,
      tableNumber: tableNumber.trim(),
      capacity: parseInt(capacity),
      location,
    };

    setTables([...tables, newTable]);
    setShowAddTable(false);
    setTableNumber("");
    setCapacity("2");
    setLocation("indoor");
  };

  const handleDeleteTable = (tableId: string) => {
    Alert.alert("Delete Table", "Are you sure you want to delete this table?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setTables(tables.filter((t) => t.tableId !== tableId));
        },
      },
    ]);
  };

  const getTotalCapacity = () => tables.reduce((sum, t) => sum + t.capacity, 0);

  const handleContinue = () => {
    if (tables.length === 0) {
      Alert.alert("Error", "Please add at least one table");
      return;
    }

    router.push({
      pathname: "/(owner)/register-restaurant/step5",
      params: {
        ...params,
        tables: JSON.stringify(tables),
        totalCapacity: getTotalCapacity().toString(),
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
          <Text style={styles.headerSubtitle}>Step 4 of 5 - Tables</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: "80%" }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Tables</Text>
            <Text style={styles.summaryValue}>{tables.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Capacity</Text>
            <Text style={styles.summaryValue}>{getTotalCapacity()} seats</Text>
          </View>
        </View>

        {/* Add Table Button */}
        {!showAddTable && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addTableButton}
              onPress={() => setShowAddTable(true)}
            >
              <MaterialIcons
                name="add-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.addTableButtonText}>Add Table</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Table Form */}
        {showAddTable && (
          <View style={styles.addTableCard}>
            <Text style={styles.addTableTitle}>New Table</Text>

            {/* Table Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Table Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 1, A1, VIP1"
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Capacity */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Capacity (Seats)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Number of seats"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="number-pad"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <View style={styles.locationButtons}>
                {["indoor", "outdoor", "private"].map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locationButton,
                      location === loc && styles.locationButtonActive,
                    ]}
                    onPress={() => setLocation(loc as any)}
                  >
                    <MaterialIcons
                      name={
                        loc === "indoor"
                          ? "meeting-room"
                          : loc === "outdoor"
                          ? "wb-sunny"
                          : "lock"
                      }
                      size={20}
                      color={location === loc ? "#FFFFFF" : theme.colors.text}
                    />
                    <Text
                      style={[
                        styles.locationButtonText,
                        location === loc && styles.locationButtonTextActive,
                      ]}
                    >
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddTable(false);
                  setTableNumber("");
                  setCapacity("2");
                  setLocation("indoor");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTable}
              >
                <Text style={styles.saveButtonText}>Add Table</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tables List */}
        {tables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tables ({tables.length})</Text>
            {tables.map((table) => (
              <View key={table.tableId} style={styles.tableCard}>
                <View style={styles.tableIcon}>
                  <MaterialIcons
                    name={
                      table.location === "indoor"
                        ? "meeting-room"
                        : table.location === "outdoor"
                        ? "wb-sunny"
                        : "lock"
                    }
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.tableInfo}>
                  <Text style={styles.tableName}>
                    Table {table.tableNumber}
                  </Text>
                  <Text style={styles.tableDetails}>
                    {table.capacity} seats • {table.location}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTable(table.tableId)}
                >
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            tables.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={tables.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: { padding: theme.spacing.xs },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressContainer: { height: 4, backgroundColor: theme.colors.surface },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary },
  content: { flex: 1 },
  summaryCard: {
    flexDirection: "row",
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  section: { padding: theme.spacing.lg },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  addTableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    backgroundColor: `${theme.colors.primary}15`,
  },
  addTableButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  addTableCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addTableTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  formGroup: { marginBottom: theme.spacing.lg },
  formLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "#FFFFFF",
  },
  locationButtons: { flexDirection: "row", gap: theme.spacing.sm },
  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  locationButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  locationButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.text,
  },
  locationButtonTextActive: { color: "#FFFFFF" },
  formActions: { flexDirection: "row", gap: theme.spacing.sm },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tableCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tableIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  tableInfo: { flex: 1 },
  tableName: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  tableDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
  },
  deleteButton: { padding: theme.spacing.xs },
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
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
