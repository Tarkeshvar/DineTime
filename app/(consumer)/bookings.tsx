import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Bookings Screen - Coming Soon!</Text>
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
  text: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
  },
});
