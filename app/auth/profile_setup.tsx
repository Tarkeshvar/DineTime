import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  SegmentedButtons,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { RolePreference } from "../../types/user";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Lucknow",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [rolePreference, setRolePreference] =
    useState<RolePreference>("consumer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!fullName || !city) {
      setError("Please fill in all fields");
      return;
    }

    if (!user) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateUserProfile({
        uid: user.uid,
        email: user.email || "",
        fullName,
        city,
        rolePreference,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Navigate based on role
      if (rolePreference === "consumer") {
        router.replace("/(consumer)/home");
      } else if (rolePreference === "owner") {
        router.replace("/(owner)/dashboard");
      } else {
        router.replace("/(consumer)/home");
      }
    } catch (err: any) {
      console.error("Profile setup error:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}></View>
        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <Text style={styles.label}>City</Text>
          <View style={styles.cityContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cityScroll}
            >
              {CITIES.map((c) => (
                <Button
                  key={c}
                  mode={city === c ? "contained" : "outlined"}
                  onPress={() => setCity(c)}
                  style={styles.cityButton}
                  disabled={loading}
                >
                  {c}
                </Button>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.label}>I want to</Text>
          <RadioButton.Group
            onValueChange={(value) =>
              setRolePreference(value as RolePreference)
            }
            value={rolePreference}
          >
            <View style={styles.radioOption}>
              <RadioButton.Item
                label="Book restaurants (Consumer)"
                value="consumer"
                disabled={loading}
              />
            </View>
            <View style={styles.radioOption}>
              <RadioButton.Item
                label="Register my restaurant (Owner)"
                value="owner"
                disabled={loading}
              />
            </View>
            <View style={styles.radioOption}>
              <RadioButton.Item label="Both" value="both" disabled={loading} />
            </View>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  cityContainer: {
    marginBottom: 25,
  },
  cityScroll: {
    flexDirection: "row",
  },
  cityButton: {
    marginRight: 10,
  },
  radioOption: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 15,
    textAlign: "center",
  },
});
