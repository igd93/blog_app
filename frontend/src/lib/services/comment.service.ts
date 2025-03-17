import api from "../axios";
import { Comment, PaginatedResponse } from "../types/api";

export class CommentService {
  static async getPostComments(
    postId: string,
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "desc"
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get<PaginatedResponse<Comment>>(
      `/posts/${postId}/comments`,
      {
        params: { page, size, sortBy, direction },
      }
    );
    return response.data;
  }

  static async createComment(
    postId: string,
    content: string
  ): Promise<Comment> {
    console.log(`Creating comment for post ${postId} with content: ${content}`);

    // Log authentication token (masked for security)
    const token = localStorage.getItem("token");
    console.log(`Auth token exists: ${!!token}`);
    if (token) {
      const maskedToken =
        token.substring(0, 10) + "..." + token.substring(token.length - 10);
      console.log(`Auth token (masked): ${maskedToken}`);
    }

    try {
      const response = await api.post<Comment>(`/posts/${postId}/comments`, {
        content,
      });
      console.log("Comment created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  static async updateComment(id: string, content: string): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${id}`, { content });
    return response.data;
  }

  static async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  }

  static async testAuth(): Promise<string> {
    // Log authentication token (masked for security)
    const token = localStorage.getItem("token");
    console.log(`Test Auth - Auth token exists: ${!!token}`);
    if (token) {
      const maskedToken =
        token.substring(0, 10) + "..." + token.substring(token.length - 10);
      console.log(`Test Auth - Auth token (masked): ${maskedToken}`);
    }

    try {
      const response = await api.get<string>("/comments/test-auth");
      console.log("Auth test successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Auth test failed:", error);
      throw error;
    }
  }
}
