import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { addMockRestaurants } from "../scripts/addMockRestaurants";
import { theme } from "../constants/theme";

export default function AdminToolsScreen() {
  const [loading, setLoading] = useState(false);

  const handleAddMockData = async () => {
    Alert.alert(
      "Add Mock Restaurants",
      "This will add 5 sample restaurants to Firestore. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: async () => {
            setLoading(true);
            const success = await addMockRestaurants();
            setLoading(false);

            if (success) {
              Alert.alert("Success", "5 restaurants added successfully!");
            } else {
              Alert.alert("Error", "Failed to add restaurants. Check console.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Tools</Text>
        <Text style={styles.subtitle}>Development utilities</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddMockData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Add Mock Restaurants</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          ⚠️ This will add 5 sample restaurants to your Firestore database. Use
          this only once for testing.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
  },
  note: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});
