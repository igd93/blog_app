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
    const response = await api.post<Comment>(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  }

  static async updateComment(id: string, content: string): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${id}`, { content });
    return response.data;
  }

  static async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  }
}
