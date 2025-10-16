import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { PaperProvider } from "react-native-paper";
import { ActivityIndicator, View } from "react-native";
import { theme } from "../constants/theme";

function RootLayoutNav() {
  const { user, userData, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || (user && !userData)) return; // ✅ Wait for data to load

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inConsumerGroup = segments[0] === "(consumer)";
    const inOwnerGroup = segments[0] === "(owner)";
    const inAdminGroup = segments[0] === "(admin)";

    console.log("🔍 Navigation State:", {
      hasUser: !!user,
      hasUserData: !!userData,
      fullName: userData?.fullName,
      phone: userData?.phoneNumber,
      isAdmin: userData?.isAdmin,
      currentSegment: segments[0],
    });

    if (!user) {
      if (!inAuthGroup) {
        console.log("➡️ Redirecting to auth");
        router.replace("/(auth)/landing");
      }
      return;
    }

    if (!userData?.fullName || !userData?.phoneNumber) {
      if (!inOnboardingGroup) {
        console.log("➡️ Redirecting to onboarding");
        router.replace("/(onboarding)/tell-us-about-you");
      }
      return;
    }

    if (userData.isAdmin) {
      if (!inAdminGroup) {
        console.log("➡️ Redirecting admin to dashboard");
        router.replace("/(admin)/dashboard");
      }
    } else {
      if (!inConsumerGroup && !inOwnerGroup) {
        console.log("➡️ Redirecting user to explore");
        router.replace("/(consumer)/explore");
      }
    }
  }, [user, userData, loading, segments]);

  // ✅ Return after hooks
  if (loading || (user && !userData)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <PaperProvider>
          <RootLayoutNav />
        </PaperProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
