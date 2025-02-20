import api from "../axios";
import { BlogPost, PaginatedResponse } from "../types/api";

export class BlogService {
  static async getPosts(
    page = 0,
    size = 10,
    sortBy = "postDate",
    direction = "desc"
  ): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get<PaginatedResponse<BlogPost>>("/posts", {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  }

  static async getPost(id: string): Promise<BlogPost> {
    const response = await api.get<BlogPost>(`/posts/${id}`);
    return response.data;
  }

  static async createPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const response = await api.post<BlogPost>("/posts", post);
    return response.data;
  }

  static async updatePost(
    id: string,
    post: Partial<BlogPost>
  ): Promise<BlogPost> {
    const response = await api.put<BlogPost>(`/posts/${id}`, post);
    return response.data;
  }

  static async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  }
}
