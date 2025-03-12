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

  static async getPostsByAuthor(authorId: string): Promise<BlogPost[]> {
    const response = await api.get<BlogPost[]>(`/posts/author/${authorId}`);
    return response.data;
  }

  static async searchPosts(
    query: string,
    page = 0,
    size = 10,
    sortBy = "postDate",
    direction = "desc"
  ): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get<PaginatedResponse<BlogPost>>(
      "/posts/search",
      {
        params: { query, page, size, sortBy, direction },
      }
    );
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
    console.log("BlogService.updatePost - Request:", { id, post });
    try {
      const response = await api.put<BlogPost>(`/posts/${id}`, post);
      console.log("BlogService.updatePost - Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("BlogService.updatePost - Error:", error);
      throw error;
    }
  }

  static async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  }
}
