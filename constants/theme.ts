export const theme = {
  colors: {
    primary: "#FF6B6B", // A bright, modern red/coral
    secondary: "#4ECDC4", // A cool teal for secondary accents
    background: "#F8F8F8", // Using F8F8F8 as a slight offset from pure white for screen background
    surface: "#FFFFFF", // Pure white for cards/surfaces
    text: "#333333",
    textSecondary: "#666666",
    border: "#E0E0E0",
    error: "#EF4444",
    success: "#10B981",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  // --- ADDED SHADOWS TO RESOLVE THE ERROR AND ENABLE MODERN DESIGN ---
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2, // Subtle elevation for Android
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 5, // Medium elevation for search bars/main cards
    },
  },
};
