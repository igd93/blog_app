import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { BlogService } from "@/lib/services/blog.service";
import { BlogPost, User, PaginatedResponse } from "@/lib/types/api";

// Mock the BlogService
vi.mock("@/lib/services/blog.service", () => ({
  BlogService: {
    getPosts: vi.fn(),
  },
}));

describe("useBlogPosts hook", () => {
  // Mock data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockPosts: BlogPost[] = [
    {
      id: "post-1",
      title: "First Test Post",
      slug: "first-test-post",
      description: "Test description 1",
      content: "Test content 1",
      status: "published",
      postDate: "2023-01-01T00:00:00Z",
      readTime: "5 min",
      author: mockUser,
      tags: [{ id: "tag-1", name: "Test Tag", slug: "test-tag" }],
    },
    {
      id: "post-2",
      title: "Second Test Post",
      slug: "second-test-post",
      description: "Test description 2",
      content: "Test content 2",
      status: "published",
      postDate: "2023-01-02T00:00:00Z",
      readTime: "3 min",
      author: mockUser,
      tags: [],
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<BlogPost> = {
    content: mockPosts,
    totalElements: 5,
    totalPages: 3,
    size: 2,
    number: 0,
    first: true,
    last: false,
  };

  const mockSecondPageResponse: PaginatedResponse<BlogPost> = {
    content: [
      {
        id: "post-3",
        title: "Third Test Post",
        slug: "third-test-post",
        description: "Test description 3",
        content: "Test content 3",
        status: "published",
        postDate: "2023-01-03T00:00:00Z",
        readTime: "4 min",
        author: mockUser,
        tags: [],
      },
    ],
    totalElements: 5,
    totalPages: 3,
    size: 2,
    number: 1,
    first: false,
    last: false,
  };

  const mockEmptyResponse: PaginatedResponse<BlogPost> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch posts on initial render", async () => {
    // Mock the API response
    vi.mocked(BlogService.getPosts).mockResolvedValueOnce(
      mockPaginatedResponse
    );

    // Render the hook
    const { result } = renderHook(() => useBlogPosts());

    // Initially should be loading with empty posts
    expect(result.current.isLoading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for the posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have posts and hasMore should be true
    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();

    // Verify the API was called with correct parameters
    expect(BlogService.getPosts).toHaveBeenCalledWith(
      0,
      10,
      "postDate",
      "desc"
    );
  });

  it("should load more posts when loadMore is called", async () => {
    // Mock the API responses
    vi.mocked(BlogService.getPosts)
      .mockResolvedValueOnce(mockPaginatedResponse)
      .mockResolvedValueOnce(mockSecondPageResponse);

    // Render the hook
    const { result } = renderHook(() => useBlogPosts());

    // Wait for initial posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call loadMore
    await act(async () => {
      await result.current.loadMore();
    });

    // Should have combined posts from both pages
    expect(result.current.posts).toEqual([
      ...mockPosts,
      ...mockSecondPageResponse.content,
    ]);
    expect(result.current.hasMore).toBe(true);

    // Verify the API was called twice with correct parameters
    expect(BlogService.getPosts).toHaveBeenCalledTimes(2);
    expect(BlogService.getPosts).toHaveBeenNthCalledWith(
      1,
      0,
      10,
      "postDate",
      "desc"
    );
    expect(BlogService.getPosts).toHaveBeenNthCalledWith(
      2,
      1,
      10,
      "postDate",
      "desc"
    );
  });

  it("should refresh posts when refresh is called", async () => {
    // Mock the API responses
    vi.mocked(BlogService.getPosts)
      .mockResolvedValueOnce(mockPaginatedResponse)
      .mockResolvedValueOnce({
        ...mockPaginatedResponse,
        content: [mockPosts[0]], // Return only the first post on refresh
      });

    // Render the hook
    const { result } = renderHook(() => useBlogPosts());

    // Wait for initial posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Should have only the refreshed posts
    expect(result.current.posts).toEqual([mockPosts[0]]);

    // Verify the API was called twice with the same parameters
    expect(BlogService.getPosts).toHaveBeenCalledTimes(2);
    expect(BlogService.getPosts).toHaveBeenNthCalledWith(
      1,
      0,
      10,
      "postDate",
      "desc"
    );
    expect(BlogService.getPosts).toHaveBeenNthCalledWith(
      2,
      0,
      10,
      "postDate",
      "desc"
    );
  });

  it("should handle errors when fetching posts", async () => {
    // Mock the API to throw an error
    const error = new Error("Failed to fetch posts");
    vi.mocked(BlogService.getPosts).mockRejectedValueOnce(error);

    // Render the hook
    const { result } = renderHook(() => useBlogPosts());

    // Wait for the error to be set
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error and empty posts
    expect(result.current.error).toEqual(error);
    expect(result.current.posts).toEqual([]);
  });

  it("should set hasMore to false when there are no more posts", async () => {
    // Mock the API to return an empty response
    vi.mocked(BlogService.getPosts).mockResolvedValueOnce(mockEmptyResponse);

    // Render the hook
    const { result } = renderHook(() => useBlogPosts());

    // Wait for the posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have empty posts and hasMore should be false
    expect(result.current.posts).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it("should use custom parameters when provided", async () => {
    // Mock the API response
    vi.mocked(BlogService.getPosts).mockResolvedValueOnce(
      mockPaginatedResponse
    );

    // Render the hook with custom parameters
    const { result } = renderHook(() => useBlogPosts(1, 20, "title", "asc"));

    // Wait for the posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the API was called with custom parameters
    expect(BlogService.getPosts).toHaveBeenCalledWith(1, 20, "title", "asc");
  });
});
