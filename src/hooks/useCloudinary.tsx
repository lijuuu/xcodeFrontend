import { useState } from "react";

const useCloudinaryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dcfoqhrxb/upload";

      if (!cloudinaryUrl) {
        throw new Error("Cloudinary URL is not defined in environment variables");
      }

      console.log("Cloudinary URL:", cloudinaryUrl);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      console.log("Cloudinary response:", data);
      if (!data.secure_url) {
        throw new Error("No secure URL returned from Cloudinary");
      }
      return data.secure_url;
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
};

export default useCloudinaryUpload;