import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentService } from "@/lib/services/comment.service";
import api from "@/lib/axios";
import { Comment, PaginatedResponse, User } from "@/lib/types/api";

// Mock the axios instance
vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("CommentService", () => {
  // Mock data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockComment: Comment = {
    id: "comment-123",
    content: "This is a test comment",
    author: mockUser,
    postId: "post-123",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockPaginatedResponse: PaginatedResponse<Comment> = {
    content: [mockComment],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getPostComments", () => {
    it("should fetch comments for a post with default pagination", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockPaginatedResponse,
      });

      // Call the service method
      const result = await CommentService.getPostComments("post-123");

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith("/posts/post-123/comments", {
        params: {
          page: 0,
          size: 10,
          sortBy: "createdAt",
          direction: "desc",
        },
      });

      // Verify the result
      expect(result).toEqual(mockPaginatedResponse);
    });

    it("should fetch comments with custom pagination parameters", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockPaginatedResponse,
      });

      // Call the service method with custom parameters
      const result = await CommentService.getPostComments(
        "post-123",
        1,
        5,
        "updatedAt",
        "asc"
      );

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith("/posts/post-123/comments", {
        params: {
          page: 1,
          size: 5,
          sortBy: "updatedAt",
          direction: "asc",
        },
      });

      // Verify the result
      expect(result).toEqual(mockPaginatedResponse);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Network error");
      vi.mocked(api.get).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(CommentService.getPostComments("post-123")).rejects.toThrow(
        "Network error"
      );

      // Verify the API was called
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("createComment", () => {
    it("should create a new comment", async () => {
      // Mock the API response
      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockComment,
      });

      // Call the service method
      const result = await CommentService.createComment(
        "post-123",
        "This is a test comment"
      );

      // Verify the API was called correctly
      expect(api.post).toHaveBeenCalledWith("/posts/post-123/comments", {
        content: "This is a test comment",
      });

      // Verify the result
      expect(result).toEqual(mockComment);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Failed to create comment");
      vi.mocked(api.post).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(
        CommentService.createComment("post-123", "This is a test comment")
      ).rejects.toThrow("Failed to create comment");

      // Verify the API was called
      expect(api.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateComment", () => {
    it("should update an existing comment", async () => {
      // Mock the API response
      const updatedComment = {
        ...mockComment,
        content: "Updated comment content",
        updatedAt: "2023-01-02T00:00:00Z",
      };
      vi.mocked(api.put).mockResolvedValueOnce({
        data: updatedComment,
      });

      // Call the service method
      const result = await CommentService.updateComment(
        "comment-123",
        "Updated comment content"
      );

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith("/comments/comment-123", {
        content: "Updated comment content",
      });

      // Verify the result
      expect(result).toEqual(updatedComment);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Failed to update comment");
      vi.mocked(api.put).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(
        CommentService.updateComment("comment-123", "Updated comment content")
      ).rejects.toThrow("Failed to update comment");

      // Verify the API was called
      expect(api.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      // Mock the API response
      vi.mocked(api.delete).mockResolvedValueOnce({
        data: undefined,
      });

      // Call the service method
      await CommentService.deleteComment("comment-123");

      // Verify the API was called correctly
      expect(api.delete).toHaveBeenCalledWith("/comments/comment-123");
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Failed to delete comment");
      vi.mocked(api.delete).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(CommentService.deleteComment("comment-123")).rejects.toThrow(
        "Failed to delete comment"
      );

      // Verify the API was called
      expect(api.delete).toHaveBeenCalledTimes(1);
    });
  });
});
