import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useComments } from "@/hooks/useComments";
import { CommentService } from "@/lib/services/comment.service";
import { Comment, PaginatedResponse, User } from "@/lib/types/api";

// Mock the CommentService
vi.mock("@/lib/services/comment.service", () => ({
  CommentService: {
    getPostComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

describe("useComments hook", () => {
  // Mock data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockComments: Comment[] = [
    {
      id: "comment-1",
      content: "First test comment",
      author: mockUser,
      postId: "post-123",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "comment-2",
      content: "Second test comment",
      author: mockUser,
      postId: "post-123",
      createdAt: "2023-01-02T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<Comment> = {
    content: mockComments,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  // Mock console methods to reduce noise in test output
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.resetAllMocks();

    // Silence console logs and errors during tests
    console.log = vi.fn();
    console.error = vi.fn();

    // Default mock implementations
    vi.mocked(CommentService.getPostComments).mockResolvedValue(
      mockPaginatedResponse
    );
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("initial state and fetching comments", () => {
    it("should fetch comments on mount", async () => {
      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.comments).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have comments data
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.totalComments).toBe(2);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.error).toBeNull();
      expect(CommentService.getPostComments).toHaveBeenCalledWith(
        "post-123",
        0,
        10,
        "createdAt",
        "desc"
      );
    });

    it("should handle errors when fetching comments", async () => {
      // Mock the service to throw an error
      const error = new Error("Failed to fetch comments");
      vi.mocked(CommentService.getPostComments).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have error state
      expect(result.current.comments).toEqual([]);
      expect(result.current.error).toEqual(error);
      expect(CommentService.getPostComments).toHaveBeenCalledTimes(1);
    });

    it("should fetch comments with custom pagination parameters", async () => {
      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset mock to track the next call
      vi.mocked(CommentService.getPostComments).mockClear();

      // Call fetchComments with custom parameters
      await act(async () => {
        await result.current.fetchComments(1, 5, "updatedAt", "asc");
      });

      // Verify the service was called with correct parameters
      expect(CommentService.getPostComments).toHaveBeenCalledWith(
        "post-123",
        1,
        5,
        "updatedAt",
        "asc"
      );
    });
  });

  describe("creating comments", () => {
    it("should create a new comment and update the list", async () => {
      // Mock the new comment
      const newComment: Comment = {
        id: "comment-3",
        content: "New test comment",
        author: mockUser,
        postId: "post-123",
        createdAt: "2023-01-03T00:00:00Z",
        updatedAt: "2023-01-03T00:00:00Z",
      };

      // Mock the service to return the new comment
      vi.mocked(CommentService.createComment).mockResolvedValueOnce(newComment);

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create a new comment
      let createdComment: Comment | undefined;
      await act(async () => {
        createdComment = await result.current.createComment("New test comment");
      });

      // Verify the service was called correctly
      expect(CommentService.createComment).toHaveBeenCalledWith(
        "post-123",
        "New test comment"
      );

      // Verify the returned comment
      expect(createdComment).toEqual(newComment);

      // Verify the comments list was updated
      expect(result.current.comments).toEqual([newComment, ...mockComments]);
      expect(result.current.totalComments).toBe(3);
    });

    it("should handle errors when creating a comment", async () => {
      // Mock the service to throw an error
      const error = new Error("Failed to create comment");
      vi.mocked(CommentService.createComment).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to create a comment and expect it to throw
      await act(async () => {
        await expect(
          result.current.createComment("New test comment")
        ).rejects.toThrow("Failed to create comment");
      });

      // Verify the service was called
      expect(CommentService.createComment).toHaveBeenCalledTimes(1);

      // Verify the error state
      expect(result.current.error).toEqual(error);

      // Verify the comments list was not updated
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.totalComments).toBe(2);
    });
  });

  describe("updating comments", () => {
    it("should update a comment and update the list", async () => {
      // Mock the updated comment
      const updatedComment: Comment = {
        ...mockComments[0],
        content: "Updated comment content",
        updatedAt: "2023-01-04T00:00:00Z",
      };

      // Mock the service to return the updated comment
      vi.mocked(CommentService.updateComment).mockResolvedValueOnce(
        updatedComment
      );

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update a comment
      let returnedComment: Comment | undefined;
      await act(async () => {
        returnedComment = await result.current.updateComment(
          "comment-1",
          "Updated comment content"
        );
      });

      // Verify the service was called correctly
      expect(CommentService.updateComment).toHaveBeenCalledWith(
        "comment-1",
        "Updated comment content"
      );

      // Verify the returned comment
      expect(returnedComment).toEqual(updatedComment);

      // Verify the comments list was updated
      expect(result.current.comments[0]).toEqual(updatedComment);
      expect(result.current.comments[1]).toEqual(mockComments[1]);
    });

    it("should handle errors when updating a comment", async () => {
      // Mock the service to throw an error
      const error = new Error("Failed to update comment");
      vi.mocked(CommentService.updateComment).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to update a comment and expect it to throw
      await act(async () => {
        await expect(
          result.current.updateComment("comment-1", "Updated content")
        ).rejects.toThrow("Failed to update comment");
      });

      // Verify the service was called
      expect(CommentService.updateComment).toHaveBeenCalledTimes(1);

      // Verify the error state
      expect(result.current.error).toEqual(error);

      // Verify the comments list was not updated
      expect(result.current.comments).toEqual(mockComments);
    });
  });

  describe("deleting comments", () => {
    it("should delete a comment and update the list", async () => {
      // Mock the service to succeed
      vi.mocked(CommentService.deleteComment).mockResolvedValueOnce();

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Delete a comment
      await act(async () => {
        await result.current.deleteComment("comment-1");
      });

      // Verify the service was called correctly
      expect(CommentService.deleteComment).toHaveBeenCalledWith("comment-1");

      // Verify the comments list was updated
      expect(result.current.comments).toEqual([mockComments[1]]);
      expect(result.current.totalComments).toBe(1);
    });

    it("should handle errors when deleting a comment", async () => {
      // Mock the service to throw an error
      const error = new Error("Failed to delete comment");
      vi.mocked(CommentService.deleteComment).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useComments("post-123"));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to delete a comment and expect it to throw
      await act(async () => {
        await expect(result.current.deleteComment("comment-1")).rejects.toThrow(
          "Failed to delete comment"
        );
      });

      // Verify the service was called
      expect(CommentService.deleteComment).toHaveBeenCalledTimes(1);

      // Verify the error state
      expect(result.current.error).toEqual(error);

      // Verify the comments list was not updated
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.totalComments).toBe(2);
    });
  });
});
