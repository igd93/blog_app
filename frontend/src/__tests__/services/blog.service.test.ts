import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlogService } from "@/lib/services/blog.service";
import api from "@/lib/axios";
import { BlogPost, PaginatedResponse, User } from "@/lib/types/api";

// Mock the axios instance
vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("BlogService", () => {
  // Mock data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockPost: BlogPost = {
    id: "post-123",
    title: "Test Post",
    slug: "test-post",
    description: "Test description",
    content: "Test content",
    status: "published",
    postDate: "2023-01-01T00:00:00Z",
    readTime: "5 min",
    author: mockUser,
    tags: [{ id: "tag-1", name: "Test Tag", slug: "test-tag" }],
  };

  const mockPaginatedResponse: PaginatedResponse<BlogPost> = {
    content: [mockPost],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getPosts", () => {
    it("should fetch posts with default parameters", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      // Call the service method
      const result = await BlogService.getPosts();

      // Verify the API was called with correct parameters
      expect(api.get).toHaveBeenCalledWith("/posts", {
        params: { page: 0, size: 10, sortBy: "postDate", direction: "desc" },
      });

      // Verify the result
      expect(result).toEqual(mockPaginatedResponse);
    });

    it("should fetch posts with custom parameters", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      // Call the service method with custom parameters
      const result = await BlogService.getPosts(1, 20, "title", "asc");

      // Verify the API was called with correct parameters
      expect(api.get).toHaveBeenCalledWith("/posts", {
        params: { page: 1, size: 20, sortBy: "title", direction: "asc" },
      });

      // Verify the result
      expect(result).toEqual(mockPaginatedResponse);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Network error");
      vi.mocked(api.get).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(BlogService.getPosts()).rejects.toThrow("Network error");
    });
  });

  describe("getPost", () => {
    it("should fetch a single post by ID", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValue({ data: mockPost });

      // Call the service method
      const result = await BlogService.getPost("post-123");

      // Verify the API was called with correct parameters
      expect(api.get).toHaveBeenCalledWith("/posts/post-123");

      // Verify the result
      expect(result).toEqual(mockPost);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Post not found");
      vi.mocked(api.get).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(BlogService.getPost("invalid-id")).rejects.toThrow(
        "Post not found"
      );
    });
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      // Mock the API response
      vi.mocked(api.post).mockResolvedValue({ data: mockPost });

      // Create post data
      const newPost: Partial<BlogPost> = {
        title: "Test Post",
        content: "Test content",
        status: "draft",
      };

      // Call the service method
      const result = await BlogService.createPost(newPost);

      // Verify the API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith("/posts", newPost);

      // Verify the result
      expect(result).toEqual(mockPost);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Validation error");
      vi.mocked(api.post).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(BlogService.createPost({ title: "" })).rejects.toThrow(
        "Validation error"
      );
    });
  });

  describe("updatePost", () => {
    it("should update an existing post", async () => {
      // Mock the API response
      const updatedPost = { ...mockPost, title: "Updated Title" };
      vi.mocked(api.put).mockResolvedValue({ data: updatedPost });

      // Update data
      const updateData: Partial<BlogPost> = {
        title: "Updated Title",
      };

      // Call the service method
      const result = await BlogService.updatePost("post-123", updateData);

      // Verify the API was called with correct parameters
      expect(api.put).toHaveBeenCalledWith("/posts/post-123", updateData);

      // Verify the result
      expect(result).toEqual(updatedPost);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Post not found");
      vi.mocked(api.put).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(
        BlogService.updatePost("invalid-id", { title: "Updated" })
      ).rejects.toThrow("Post not found");
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      // Mock the API response
      vi.mocked(api.delete).mockResolvedValue({ data: null });

      // Call the service method
      await BlogService.deletePost("post-123");

      // Verify the API was called with correct parameters
      expect(api.delete).toHaveBeenCalledWith("/posts/post-123");
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Post not found");
      vi.mocked(api.delete).mockRejectedValue(error);

      // Call the service method and expect it to throw
      await expect(BlogService.deletePost("invalid-id")).rejects.toThrow(
        "Post not found"
      );
    });
  });
});
