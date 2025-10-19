import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Table } from "../../types";
import { theme } from "../../constants/theme";

interface TableSelectorProps {
  tables: Table[];
  numberOfGuests: number;
  selectedTables: Table[];
  onTableSelect: (tables: Table[]) => void;
}

export default function TableSelector({
  tables,
  numberOfGuests,
  selectedTables,
  onTableSelect,
}: TableSelectorProps) {
  const handleTableToggle = (table: Table) => {
    const isSelected = selectedTables.some((t) => t.tableId === table.tableId);

    if (isSelected) {
      // Deselect table
      onTableSelect(selectedTables.filter((t) => t.tableId !== table.tableId));
    } else {
      // Select table - check capacity
      const currentCapacity = selectedTables.reduce(
        (sum, t) => sum + t.capacity,
        0
      );
      const newCapacity = currentCapacity + table.capacity;

      if (newCapacity > numberOfGuests + 2) {
        Alert.alert(
          "Too Many Seats",
          "Selected tables exceed guest count significantly. Please adjust."
        );
        return;
      }

      onTableSelect([...selectedTables, table]);
    }
  };

  const getTotalCapacity = () => {
    return selectedTables.reduce((sum, t) => sum + t.capacity, 0);
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "indoor":
        return "meeting-room";
      case "outdoor":
        return "wb-sunny";
      case "private":
        return "lock";
      default:
        return "table-restaurant";
    }
  };

  const groupedTables = {
    indoor: tables.filter((t) => t.location === "indoor"),
    outdoor: tables.filter((t) => t.location === "outdoor"),
    private: tables.filter((t) => t.location === "private"),
  };

  return (
    <View style={styles.container}>
      {/* Capacity Info */}
      <View style={styles.capacityInfo}>
        <Text style={styles.capacityText}>
          Selected Capacity: {getTotalCapacity()} / {numberOfGuests} guests
        </Text>
        {getTotalCapacity() < numberOfGuests && (
          <Text style={styles.capacityWarning}>
            ⚠️ Need more seats for all guests
          </Text>
        )}
      </View>

      {/* Indoor Tables */}
      {groupedTables.indoor.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="meeting-room" size={16} /> Indoor Tables
          </Text>
          <View style={styles.tableGrid}>
            {groupedTables.indoor.map((table) => {
              const isSelected = selectedTables.some(
                (t) => t.tableId === table.tableId
              );
              return (
                <TouchableOpacity
                  key={table.tableId}
                  style={[
                    styles.tableCard,
                    isSelected && styles.tableCardSelected,
                  ]}
                  onPress={() => handleTableToggle(table)}
                >
                  <Text
                    style={[
                      styles.tableNumber,
                      isSelected && styles.tableNumberSelected,
                    ]}
                  >
                    Table {table.tableNumber}
                  </Text>
                  <View style={styles.tableCapacity}>
                    <MaterialIcons
                      name="person"
                      size={14}
                      color={
                        isSelected ? "#FFFFFF" : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.capacityLabel,
                        isSelected && styles.capacityLabelSelected,
                      ]}
                    >
                      {table.capacity}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Outdoor Tables */}
      {groupedTables.outdoor.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="wb-sunny" size={16} /> Outdoor Tables
          </Text>
          <View style={styles.tableGrid}>
            {groupedTables.outdoor.map((table) => {
              const isSelected = selectedTables.some(
                (t) => t.tableId === table.tableId
              );
              return (
                <TouchableOpacity
                  key={table.tableId}
                  style={[
                    styles.tableCard,
                    isSelected && styles.tableCardSelected,
                  ]}
                  onPress={() => handleTableToggle(table)}
                >
                  <Text
                    style={[
                      styles.tableNumber,
                      isSelected && styles.tableNumberSelected,
                    ]}
                  >
                    Table {table.tableNumber}
                  </Text>
                  <View style={styles.tableCapacity}>
                    <MaterialIcons
                      name="person"
                      size={14}
                      color={
                        isSelected ? "#FFFFFF" : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.capacityLabel,
                        isSelected && styles.capacityLabelSelected,
                      ]}
                    >
                      {table.capacity}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Private Tables */}
      {groupedTables.private.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="lock" size={16} /> Private Dining
          </Text>
          <View style={styles.tableGrid}>
            {groupedTables.private.map((table) => {
              const isSelected = selectedTables.some(
                (t) => t.tableId === table.tableId
              );
              return (
                <TouchableOpacity
                  key={table.tableId}
                  style={[
                    styles.tableCard,
                    styles.privateTableCard,
                    isSelected && styles.tableCardSelected,
                  ]}
                  onPress={() => handleTableToggle(table)}
                >
                  <Text
                    style={[
                      styles.tableNumber,
                      isSelected && styles.tableNumberSelected,
                    ]}
                  >
                    Table {table.tableNumber}
                  </Text>
                  <View style={styles.tableCapacity}>
                    <MaterialIcons
                      name="person"
                      size={14}
                      color={
                        isSelected ? "#FFFFFF" : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.capacityLabel,
                        isSelected && styles.capacityLabelSelected,
                      ]}
                    >
                      {table.capacity}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  capacityInfo: {
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  capacityText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  capacityWarning: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  tableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  tableCard: {
    width: "48%",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  tableCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  privateTableCard: {
    borderColor: "#8B5CF6",
  },
  tableNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  tableNumberSelected: {
    color: "#FFFFFF",
  },
  tableCapacity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  capacityLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  capacityLabelSelected: {
    color: "#FFFFFF",
  },
  checkBadge: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
