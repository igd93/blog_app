import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../../pages/HomePage";
import { BlogService } from "@/lib/services/blog.service";
import { toast } from "sonner";

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock("@/lib/services/blog.service");
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock data for testing
const mockPosts = {
  content: [
    {
      id: "1",
      title: "First Test Post",
      description: "This is the first test post description",
      slug: "first-test-post",
      postDate: "2024-03-06T12:00:00Z",
      readTime: "3 min read",
      author: {
        id: "1",
        username: "johndoe",
        email: "john@example.com",
        fullName: "John Doe",
        avatarUrl: "test.jpg",
      },
      tags: [
        { id: "1", name: "React", slug: "react" },
        { id: "2", name: "JavaScript", slug: "javascript" },
      ],
      status: "PUBLISHED" as const,
      content: "Content of the first post",
    },
    {
      id: "2",
      title: "Second Test Post",
      description: "This is the second test post description",
      slug: "second-test-post",
      postDate: "2024-03-07T12:00:00Z",
      readTime: "5 min read",
      author: {
        id: "2",
        username: "janedoe",
        email: "jane@example.com",
        fullName: "Jane Doe",
        avatarUrl: "test2.jpg",
      },
      tags: [{ id: "2", name: "JavaScript", slug: "javascript" }],
      status: "PUBLISHED" as const,
      content: "Content of the second post",
    },
  ],
  totalElements: 5,
  totalPages: 3,
  size: 2,
  number: 0,
  first: true,
  last: false,
};

// Second page of posts for load more testing
const mockMorePosts = {
  content: [
    {
      id: "3",
      title: "Third Test Post",
      description: "This is the third test post description",
      slug: "third-test-post",
      postDate: "2024-03-08T12:00:00Z",
      readTime: "4 min read",
      author: {
        id: "1",
        username: "johndoe",
        email: "john@example.com",
        fullName: "John Doe",
        avatarUrl: "test.jpg",
      },
      tags: [{ id: "3", name: "TypeScript", slug: "typescript" }],
      status: "PUBLISHED" as const,
      content: "Content of the third post",
    },
  ],
  totalElements: 5,
  totalPages: 3,
  size: 2,
  number: 1,
  first: false,
  last: false,
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the navigate mock
    mockNavigate.mockReset();

    // Mock first page of posts
    vi.mocked(BlogService.getPosts).mockImplementation((page) => {
      if (page === 0) {
        return Promise.resolve(mockPosts);
      } else {
        return Promise.resolve(mockMorePosts);
      }
    });
  });

  it("renders loading state initially", () => {
    render(<HomePage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renders blog posts after loading", async () => {
    render(<HomePage />);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    });

    // Check post titles
    expect(screen.getByText("First Test Post")).toBeInTheDocument();
    expect(screen.getByText("Second Test Post")).toBeInTheDocument();

    // Check post descriptions (with ellipsis)
    const firstPostDesc = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "p" &&
        content.includes("This is the first test post description")
      );
    });
    expect(firstPostDesc).toBeInTheDocument();

    const secondPostDesc = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "p" &&
        content.includes("This is the second test post description")
      );
    });
    expect(secondPostDesc).toBeInTheDocument();

    // Check for author information
    const authorRegex1 = new RegExp(
      `By ${mockPosts.content[0].author.fullName}`
    );
    const authorRegex2 = new RegExp(
      `By ${mockPosts.content[1].author.fullName}`
    );
    expect(screen.getByText(authorRegex1)).toBeInTheDocument();
    expect(screen.getByText(authorRegex2)).toBeInTheDocument();

    // Check for tags
    expect(screen.getByText("React")).toBeInTheDocument();
    // Use getAllByText for JavaScript since it appears multiple times
    const javascriptTags = screen.getAllByText("JavaScript");
    expect(javascriptTags.length).toBe(2); // Should find 2 JavaScript tags
  });

  it("loads more posts when clicking load more button", async () => {
    render(<HomePage />);

    // Wait for initial posts to load
    await waitFor(() => {
      expect(screen.getByText("First Test Post")).toBeInTheDocument();
    });

    // Click load more button
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // Verify second page is requested
    await waitFor(() => {
      expect(BlogService.getPosts).toHaveBeenCalledTimes(2);
      expect(BlogService.getPosts).toHaveBeenNthCalledWith(2, 1);
    });

    // Verify new posts are added to the list
    await waitFor(() => {
      expect(screen.getByText("Third Test Post")).toBeInTheDocument();
    });
  });

  it("navigates to blog detail page when clicking on a post", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("First Test Post")).toBeInTheDocument();
    });

    // Find the first post card using data-testid and click it
    const firstPostCard = screen.getByTestId("post-card-1");
    expect(firstPostCard).toBeInTheDocument();

    fireEvent.click(firstPostCard);

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/blog/1");
  });

  it("displays no more posts message when there are no more posts", async () => {
    // Mock the service to return empty content for the second page
    vi.mocked(BlogService.getPosts).mockImplementation((page) => {
      if (page === 0) {
        return Promise.resolve(mockPosts);
      } else {
        return Promise.resolve({
          ...mockMorePosts,
          content: [],
          last: true,
        });
      }
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("First Test Post")).toBeInTheDocument();
    });

    // Click load more button
    const loadMoreButton = screen.getByText("Load More");
    await fireEvent.click(loadMoreButton);

    // Wait for the "No more posts" message
    await waitFor(() => {
      expect(screen.queryByText("Load More")).not.toBeInTheDocument();
    });
  });

  // Test 3: Error handling - Generic error
  it("handles generic errors when fetching posts", async () => {
    // Mock the service to throw a generic error
    vi.mocked(BlogService.getPosts).mockRejectedValueOnce(
      new Error("Failed to fetch posts")
    );

    render(<HomePage />);

    // Wait for error handling to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An unexpected error occurred while fetching posts"
      );
    });
  });

  // Test 4: Error handling - API error
  it("handles API errors when fetching posts", async () => {
    // Create a mock error that mimics an API error response
    const mockApiError = {
      isAxiosError: true,
      response: {
        data: {
          message: "API error message",
        },
      },
    };

    // Mock the service to throw the mock API error
    vi.mocked(BlogService.getPosts).mockRejectedValueOnce(mockApiError);

    render(<HomePage />);

    // Wait for error handling to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("API error message");
    });
  });

  // Test 5: No more posts
  it("hides load more button when there are no more posts", async () => {
    // ... existing code ...
  });
});
