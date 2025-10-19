import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";

export default function Index() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      console.log("⏳ Index: Auth loading...");
      return;
    }

    console.log("🎯 Index: Determining initial route...", {
      hasUser: !!user,
      hasUserData: !!userData,
      fullName: userData?.fullName,
      phoneNumber: userData?.phoneNumber,
      isAdmin: userData?.isAdmin,
    });

    // Small delay to ensure auth state is settled
    const timer = setTimeout(() => {
      if (!user) {
        console.log("➡️ Index: No user, going to landing");
        router.replace("/(auth)/landing");
      } else if (!userData?.fullName || !userData?.phoneNumber) {
        console.log(
          "➡️ Index: User exists but incomplete profile, going to onboarding"
        );
        router.replace("/(onboarding)/tell-us-about-you");
      } else if (userData.isAdmin) {
        console.log("➡️ Index: Admin user, going to dashboard");
        router.replace("/(admin)/dashboard");
      } else {
        console.log("➡️ Index: Regular user, going to explore");
        router.replace("/(consumer)/explore");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, userData, loading]);

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
