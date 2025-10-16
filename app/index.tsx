import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    console.log("Navigation check:", {
      user: user?.uid,
      userData: userData?.fullName,
      currentSegment: segments[0],
      loading,
    });

    if (!user) {
      // Not logged in → go to auth
      if (!inAuthGroup) {
        router.replace("/(auth)/landing");
      }
    } else if (!userData?.fullName || !userData?.phoneNumber) {
      // Logged in but incomplete profile → go to onboarding
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/tell-us-about-you");
      }
    } else if (userData?.isAdmin) {
      // Admin user → go to admin dashboard
      router.replace("/(admin)/dashboard");
    } else {
      // Regular user → go to explore
      router.replace("/(consumer)/explore");
    }
  }, [user, userData, loading, segments]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
