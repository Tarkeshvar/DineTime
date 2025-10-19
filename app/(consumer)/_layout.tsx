import React from "react";
import { Stack } from "expo-router";

export default function ConsumerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="explore" />
      <Stack.Screen name="bookings" />
      <Stack.Screen
        name="restaurant/[id]"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="booking/[id]"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="profile-menu"
        options={{
          presentation: "transparentModal",
          animation: "none",
        }}
      />
      <Stack.Screen
        name="location-selector"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
