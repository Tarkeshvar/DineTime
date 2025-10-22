import React from "react";
import { Tabs, useSegments } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

export default function OwnerLayout() {
  // Detect the current route path segments
  const segments = useSegments();
  const isRegisterFlow = segments.includes("register-restaurant");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: isRegisterFlow
          ? { display: "none" } // Hide tab bar during registration steps
          : {
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="my-restaurants"
        options={{
          title: "My Restaurants",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="storefront" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="manage-bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="insights" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden from tab bar navigation */}
      <Tabs.Screen
        name="register-restaurant"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
