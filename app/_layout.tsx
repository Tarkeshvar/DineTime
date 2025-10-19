import { useEffect } from "react";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
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
    if (loading || (user && !userData)) return; // Wait for auth + Firestore data

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inConsumerGroup = segments[0] === "(consumer)";
    const inOwnerGroup = segments[0] === "(owner)";
    const inAdminGroup = segments[0] === "(admin)";

    // ✅ 1. If not logged in → go to landing
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/landing");
      }
      return;
    }

    // ✅ 2. If onboarding not done → go to onboarding
    if (!userData?.fullName || !userData?.phoneNumber) {
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/tell-us-about-you");
      }
      return;
    }

    // ✅ 3. If admin → go to admin dashboard
    if (userData.isAdmin) {
      if (!inAdminGroup) {
        router.replace("/(admin)/dashboard");
      }
      return;
    }

    // ✅ 4. If owner/consumer → go to their respective sections
    if (userData.rolePreference === "owner") {
      if (!inOwnerGroup) {
        router.replace("/(owner)/my-restaurants");
      }
    } else {
      if (!inConsumerGroup) {
        router.replace("/(consumer)/explore");
      }
    }
  }, [user, userData, loading, segments]);

  // ✅ Loading state (Firebase Auth + Firestore userData)
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

  // ✅ Main navigation stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(consumer)" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

// ✅ Root Layout Provider Wrapper
export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <PaperProvider theme={theme}>
          <RootLayoutNav />
        </PaperProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
