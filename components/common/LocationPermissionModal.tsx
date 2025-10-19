import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../constants/theme";

interface Props {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

export default function LocationPermissionModal({
  visible,
  onAllow,
  onSkip,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <MaterialIcons
            name="location-on"
            size={64}
            color={theme.colors.primary}
            style={{ marginBottom: theme.spacing.md }}
          />
          <Text style={styles.title}>Enable Location Access</Text>
          <Text style={styles.subtitle}>
            Allow DineTime to access your location to show nearby restaurants.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.allowBtn} onPress={onAllow}>
              <Text style={styles.allowText}>Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  allowBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  allowText: {
    color: "#fff",
    fontWeight: "bold",
  },
  skipBtn: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  skipText: {
    color: theme.colors.text,
  },
});
