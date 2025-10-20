import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { theme } from "../../../constants/theme";

const CLOUD_NAME = "dzbazi9fw";
const UPLOAD_PRESET = "Restaurants_Image";

export default function RegisterStep5() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, userData } = useAuth();

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // ================================
  // 📤 CLOUDINARY UPLOAD FUNCTION
  // ================================
  const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
      const data = new FormData();
      data.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("folder", "restaurants");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      if (result.secure_url) return result.secure_url;
      console.log("Cloudinary upload failed:", result);
      return null;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  // ================================
  // 📸 PICK IMAGES
  // ================================
  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const pickGalleryImages = async () => {
    if (galleryImages.length >= 10) {
      Alert.alert("Limit Reached", "You can upload up to 10 gallery images");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      const total = galleryImages.length + newImages.length;

      if (total > 10) {
        Alert.alert(
          "Limit Exceeded",
          "You can only upload up to 10 gallery images"
        );
        return;
      }

      setGalleryImages([...galleryImages, ...newImages]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // ================================
  // 🚀 SUBMIT HANDLER
  // ================================
  const handleSubmit = async () => {
    if (!coverImage) {
      Alert.alert("Error", "Please upload a cover image");
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading images...");

    try {
      const restaurantId = `rest_${Date.now()}`;

      // Upload cover image
      setUploadProgress("Uploading cover image...");
      const coverImageUrl = await uploadToCloudinary(coverImage);
      if (!coverImageUrl) throw new Error("Cover upload failed");

      // Upload gallery images
      const galleryUrls: string[] = [];
      for (let i = 0; i < galleryImages.length; i++) {
        setUploadProgress(
          `Uploading gallery image ${i + 1}/${galleryImages.length}...`
        );
        const url = await uploadToCloudinary(galleryImages[i]);
        if (url) galleryUrls.push(url);
      }

      setUploadProgress("Creating restaurant...");

      // Parse params
      const operatingHours = JSON.parse(params.operatingHours as string);
      const tables = JSON.parse(params.tables as string);
      const cuisineArray = (params.cuisine as string).split(",");

      const searchKeywords = [
        params.name?.toString().toLowerCase(),
        ...cuisineArray.map((c) => c.toLowerCase()),
        params.city?.toString().toLowerCase(),
      ].filter(Boolean);

      const restaurantData = {
        ownerId: user?.uid,
        ownerName: userData?.fullName,
        ownerContact: userData?.phoneNumber,
        name: params.name,
        description: params.description,
        cuisine: cuisineArray,
        priceRange: params.priceRange,
        address: {
          street: params.street,
          city: params.city,
          state: params.state,
          pincode: params.pincode,
          landmark: params.landmark || "",
        },
        coordinates: {
          latitude: parseFloat(params.latitude as string),
          longitude: parseFloat(params.longitude as string),
        },
        phone: params.phone,
        email: params.email || "",
        website: params.website || "",
        operatingHours,
        tables,
        totalCapacity: parseInt(params.totalCapacity as string),
        images: {
          coverImage: coverImageUrl,
          gallery: galleryUrls,
          menuImages: [],
        },
        amenities: ["WiFi", "Parking", "AC"],
        features: ["Family Friendly", "Casual Dining"],
        bookingFeePerPerson: 50,
        cancellationPolicy: {
          allowCancellation: true,
          isRefundable: false,
          minimumNoticeHours: 0,
        },
        status: "pending",
        totalBookings: 0,
        averageRating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        searchKeywords,
      };

      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          ownedRestaurants: arrayUnion(docRef.id),
        });
      }

      setUploading(false);
      setUploadProgress("");
      Alert.alert(
        "Success 🎉",
        "Your restaurant has been submitted for approval.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(owner)/my-restaurants"),
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting restaurant:", error);
      Alert.alert("Error", "Failed to submit restaurant. Please try again.");
      setUploading(false);
      setUploadProgress("");
    }
  };

  // ================================
  // 🖼️ UI
  // ================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add Restaurant</Text>
          <Text style={styles.headerSubtitle}>Step 5 of 5 - Images</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: "100%" }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* COVER IMAGE */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Cover Image <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helperText}>
            Main image for your restaurant (16:9 ratio recommended)
          </Text>

          {coverImage ? (
            <View style={styles.coverImageContainer}>
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCoverImage(null)}
              >
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickCoverImage}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={48}
                color={theme.colors.primary}
              />
              <Text style={styles.uploadButtonText}>Upload Cover Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* GALLERY IMAGES */}
        <View style={styles.section}>
          <Text style={styles.label}>Gallery Images (Optional)</Text>
          <Text style={styles.helperText}>
            Upload up to 10 images ({galleryImages.length}/10)
          </Text>

          <View style={styles.galleryGrid}>
            {galleryImages.map((uri, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image source={{ uri }} style={styles.galleryImage} />
                <TouchableOpacity
                  style={styles.removeGalleryImageButton}
                  onPress={() => removeGalleryImage(index)}
                >
                  <MaterialIcons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {galleryImages.length < 10 && (
              <TouchableOpacity
                style={styles.addGalleryButton}
                onPress={pickGalleryImages}
              >
                <MaterialIcons
                  name="add"
                  size={32}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Your restaurant will be submitted for admin approval. You will be
            notified once it's reviewed.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.uploadingText}>{uploadProgress}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !coverImage && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!coverImage}
          >
            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit for Approval</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ✅ STYLES (same as yours)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: { padding: theme.spacing.xs },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressContainer: { height: 4, backgroundColor: theme.colors.surface },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary },
  content: { flex: 1 },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  required: { color: theme.colors.error },
  helperText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  coverImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%" },
  removeImageButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  uploadButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  galleryImageContainer: {
    position: "relative",
    width: "31%",
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  galleryImage: { width: "100%", height: "100%" },
  removeGalleryImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  addGalleryButton: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  bottomBar: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  uploadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
