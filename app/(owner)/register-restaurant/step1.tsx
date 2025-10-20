import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";

const CUISINES = [
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Japanese",
  "Continental",
  "Fast Food",
  "Cafe",
  "American",
  "Mediterranean",
  "Korean",
];

const PRICE_RANGES = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"];

export default function RegisterStep1() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("₹₹");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      if (selectedCuisines.length < 5) {
        setSelectedCuisines([...selectedCuisines, cuisine]);
      } else {
        Alert.alert("Limit Reached", "You can select up to 5 cuisines");
      }
    }
  };

  const handleContinue = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter restaurant name");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter description");
      return;
    }
    if (selectedCuisines.length === 0) {
      Alert.alert("Error", "Please select at least one cuisine");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter contact phone");
      return;
    }

    // Store data in global state or pass as params
    // For now, we'll use route params
    router.push({
      pathname: "/(owner)/register-restaurant/step2",
      params: {
        name,
        description,
        cuisine: selectedCuisines.join(","),
        priceRange,
        phone,
        email,
        website,
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
          <Text style={styles.headerSubtitle}>Step 1 of 5 - Basic Info</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: "20%" }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Name */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Restaurant Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter restaurant name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your restaurant..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Cuisine Types */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Cuisine Types <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helperText}>Select up to 5 cuisines</Text>
          <View style={styles.cuisineGrid}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.cuisineChip,
                  selectedCuisines.includes(cuisine) &&
                    styles.cuisineChipSelected,
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.cuisineChipText,
                    selectedCuisines.includes(cuisine) &&
                      styles.cuisineChipTextSelected,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Price Range <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceRangeContainer}>
            {PRICE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.priceRangeButton,
                  priceRange === range && styles.priceRangeButtonSelected,
                ]}
                onPress={() => setPriceRange(range as any)}
              >
                <Text
                  style={[
                    styles.priceRangeText,
                    priceRange === range && styles.priceRangeTextSelected,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Phone */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Contact Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Email (Optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="restaurant@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Website (Optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Website (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  helperText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  cuisineChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  cuisineChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cuisineChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.text,
  },
  cuisineChipTextSelected: {
    color: "#FFFFFF",
  },
  priceRangeContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  priceRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  priceRangeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  priceRangeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  priceRangeTextSelected: {
    color: "#FFFFFF",
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
