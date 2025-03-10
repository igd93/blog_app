import api from "../axios";

export class FileService {
  static async uploadPostImage(postId: string, file: File): Promise<string> {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Set the correct headers for multipart/form-data
    const response = await api.post<{ imageUrl: string }>(
      `/posts/${postId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.imageUrl;
  }

  static async getPostImageUrl(
    postId: string,
    expiryMinutes = 60
  ): Promise<string> {
    const response = await api.get<{ imageUrl: string }>(
      `/posts/${postId}/image/url`,
      {
        params: { expiryMinutes },
      }
    );

    return response.data.imageUrl;
  }
}
