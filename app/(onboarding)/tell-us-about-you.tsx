import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";
import { RolePreference } from "../../types";


export default function TellUsAboutYouScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<RolePreference>("consumer");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }

    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return false;
    }

    return true;
  };

const handleContinue = async () => {
  if (!validateForm()) return;

  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert("Error", "No user found. Please sign in again.");
    return;
  }

  // Refresh user state before checking verification
  await currentUser.reload();

  if (!currentUser.emailVerified) {
    Alert.alert(
      "Email Not Verified",
      "Please verify your email before continuing."
    );
    return;
  }

  setLoading(true);
  try {
    await updateUserProfile({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      rolePreference: selectedRole,
    });

    if (selectedRole === "owner" || selectedRole === "both") {
      Alert.alert("Success", "Profile created!", [
        {
          text: "OK",
          onPress: () => router.replace("/(consumer)/explore"),
        },
      ]);
    } else {
      router.replace("/(consumer)/explore");
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="person-outline"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="person"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email (Pre-filled, Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <MaterialIcons
                name="email"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={user?.email || ""}
                editable={false}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="+1 (234) 567-8900"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Role Preference */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              I want to <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helperText}>Choose what applies to you</Text>

            <View style={styles.roleContainer}>
              {/* Consumer Option */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === "consumer" && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole("consumer")}
                activeOpacity={0.7}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons
                    name="restaurant-menu"
                    size={32}
                    color={
                      selectedRole === "consumer"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === "consumer" && styles.roleTitleSelected,
                  ]}
                >
                  Book Tables
                </Text>
                <Text style={styles.roleDescription}>
                  Discover and book restaurants
                </Text>
                {selectedRole === "consumer" && (
                  <View style={styles.checkIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* Owner Option */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === "owner" && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole("owner")}
                activeOpacity={0.7}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons
                    name="storefront"
                    size={32}
                    color={
                      selectedRole === "owner"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === "owner" && styles.roleTitleSelected,
                  ]}
                >
                  Own a Restaurant
                </Text>
                <Text style={styles.roleDescription}>
                  Register and manage your restaurant
                </Text>
                {selectedRole === "owner" && (
                  <View style={styles.checkIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* Both Option */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === "both" && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole("both")}
                activeOpacity={0.7}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons
                    name="people"
                    size={32}
                    color={
                      selectedRole === "both"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === "both" && styles.roleTitleSelected,
                  ]}
                >
                  Both
                </Text>
                <Text style={styles.roleDescription}>
                  Book tables and manage restaurants
                </Text>
                {selectedRole === "both" && (
                  <View style={styles.checkIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
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
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  roleContainer: {
    gap: theme.spacing.md,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  roleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  roleIconContainer: {
    marginBottom: theme.spacing.sm,
  },
  roleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roleTitleSelected: {
    color: theme.colors.primary,
  },
  roleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  checkIcon: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
  },
});