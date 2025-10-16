import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../constants/theme";

interface LocationPermissionModalProps {
  visible: boolean;
  loading: boolean;
  onAllowWhileUsing: () => void;
  onAllowOnce: () => void;
  onDontAllow: () => void;
}

const { width } = Dimensions.get("window");

export default function LocationPermissionModal({
  visible,
  loading,
  onAllowWhileUsing,
  onAllowOnce,
  onDontAllow,
}: LocationPermissionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.container}>
          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="location-on"
                size={64}
                color={theme.colors.primary}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Find Restaurants Near You</Text>

            {/* Description */}
            <Text style={styles.description}>
              We'll show you the best dining options nearby based on your
              location
            </Text>

            {/* Benefits */}
            <View style={styles.benefits}>
              <BenefitItem icon="near-me" text="Discover nearby restaurants" />
              <BenefitItem
                icon="explore"
                text="Get personalized recommendations"
              />
              <BenefitItem
                icon="directions"
                text="See accurate distances & directions"
              />
            </View>

            {/* Buttons */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                {/* Allow While Using */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onAllowWhileUsing}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Allow While Using App
                  </Text>
                </TouchableOpacity>

                {/* Allow Once */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onAllowOnce}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="location-searching"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.secondaryButtonText}>Allow Once</Text>
                </TouchableOpacity>

                {/* Don't Allow */}
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={onDontAllow}
                  activeOpacity={0.8}
                >
                  <Text style={styles.textButtonText}>Don't Allow</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Privacy Note */}
            <Text style={styles.privacyNote}>
              🔒 Your location data is only used to show nearby restaurants and
              is never shared with third parties
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Benefit Item Component
const BenefitItem = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.benefitItem}>
    <MaterialIcons name={icon} size={20} color={theme.colors.primary} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: width - 48,
    maxWidth: 400,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  benefits: {
    width: "100%",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  benefitText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  buttons: {
    width: "100%",
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: `${theme.colors.primary}15`,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  textButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  textButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
  },
  privacyNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.lg,
    lineHeight: 18,
  },
});
