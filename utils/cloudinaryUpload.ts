import * as ImagePicker from "expo-image-picker";

const CLOUD_NAME = "dzbazi9fw"; // your cloud name
const UPLOAD_PRESET = "Restaurants_Image"; // your unsigned preset name

// ==================== Single Image Upload ====================
export const uploadSingleImage = async (): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      type: "image/jpeg",
      name: `cover_${Date.now()}.jpg`,
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "restaurants/cover");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Uploaded Cover Image:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary single upload error:", error);
    return null;
  }
};

// ==================== Multiple Images Upload ====================
export const uploadMultipleImages = async (
  folder: "gallery" | "menu" = "gallery"
): Promise<string[]> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return [];

    const urls: string[] = [];

    for (const asset of result.assets) {
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: "image/jpeg",
        name: `${folder}_${Date.now()}.jpg`,
      } as any);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", `restaurants/${folder}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      urls.push(data.secure_url);
      console.log(`${folder} image uploaded:`, data.secure_url);
    }

    return urls;
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);
    return [];
  }
};
