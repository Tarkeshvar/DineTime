import { View, StyleSheet } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, userProfile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{userProfile?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>City:</Text>
          <Text style={styles.infoValue}>{userProfile?.city}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{userProfile?.rolePreference}</Text>
        </View>
      </View>

      <Button mode="contained" onPress={signOut} style={styles.button}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  divider: {
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  button: {
    marginTop: "auto",
  },
});
