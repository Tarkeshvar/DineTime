import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";

export default function ConsumerHomeScreen() {
  const { userProfile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userProfile?.fullName}!</Text>
      <Text style={styles.subtitle}>Explore restaurants coming soon...</Text>

      <Button mode="outlined" onPress={signOut} style={styles.button}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
  },
});
