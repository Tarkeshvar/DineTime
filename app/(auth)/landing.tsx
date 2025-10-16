import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image with Overlay */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <MaterialIcons name="restaurant" size={80} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={styles.title}>DineTime</Text>
            <Text style={styles.subtitle}>
              Discover & Book the Best Restaurants
            </Text>

            {/* Features */}
            <View style={styles.features}>
              <FeatureItem icon="search" text="Explore Restaurants" />
              <FeatureItem icon="event" text="Easy Booking" />
              <FeatureItem icon="star" text="Exclusive Deals" />
            </View>

            {/* CTA Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(auth)/signup")}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// Feature Item Component
const FeatureItem = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.featureItem}>
    <MaterialIcons name={icon} size={24} color="#FFFFFF" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    opacity: 0.9,
  },
  features: {
    marginBottom: theme.spacing.xxl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: "#FFFFFF",
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    width: "100%",
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.sm,
    textDecorationLine: "underline",
  },
});
