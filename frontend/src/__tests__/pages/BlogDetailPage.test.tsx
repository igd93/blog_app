import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogDetailPage from "../../pages/BlogDetailPage";
import { BlogService } from "@/lib/services/blog.service";
import { CommentService } from "@/lib/services/comment.service";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "sonner";

// Mock the services
vi.mock("@/lib/services/blog.service");
vi.mock("@/lib/services/comment.service");
vi.mock("@/lib/services/auth.service");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPost = {
  id: "1",
  title: "Test Post",
  description: "Test Description",
  content: "Test Content\nSecond Paragraph",
  author: {
    id: "1",
    username: "johndoe",
    email: "john@example.com",
    fullName: "John Doe",
    avatarUrl: "test.jpg",
  },
  postDate: "2024-03-06T12:00:00Z",
  readTime: "5 min read",
  tags: [{ id: "1", name: "test", slug: "test" }],
  slug: "test-post",
  status: "PUBLISHED" as const,
};

const mockComments = {
  content: [
    {
      id: "1",
      content: "Test comment",
      postId: "1",
      createdAt: "2024-03-06T12:00:00Z",
      updatedAt: "2024-03-06T12:00:00Z",
      author: {
        id: "1",
        username: "janedoe",
        email: "jane@example.com",
        fullName: "Jane Doe",
        avatarUrl: "test.jpg",
      },
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

describe("BlogDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock service responses
    vi.mocked(BlogService.getPost).mockResolvedValue(mockPost);
    vi.mocked(CommentService.getPostComments).mockResolvedValue(mockComments);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
      id: "1",
      username: "testuser",
      email: "test@example.com",
      fullName: "Test User",
      avatarUrl: "test.jpg",
    });
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={["/blog/1"]}>
        <Routes>
          <Route path="/blog/:id" element={<BlogDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders loading state initially", () => {
    renderWithRouter();
    // Find the loading spinner by its data-testid
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Alternative way to find it by class (commented out)
    // expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders blog post content after loading", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    expect(screen.getByText(mockPost.description)).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Second Paragraph")).toBeInTheDocument();
  });

  it("displays author information and metadata", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(mockPost.author.fullName)).toBeInTheDocument();
    });

    expect(screen.getByText("5 min read")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument(); // Tag name
  });

  it("renders comments section", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Comments")).toBeInTheDocument();
    });

    expect(
      screen.getByText(mockComments.content[0].content)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockComments.content[0].author.fullName)
    ).toBeInTheDocument();
  });

  it("shows login prompt when user is not authenticated", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Please log in to comment")).toBeInTheDocument();
    });
  });

  it("allows commenting when user is authenticated", async () => {
    // Mock authenticated state
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(CommentService.createComment).mockResolvedValue({
      id: "2",
      content: "New comment",
      postId: "1",
      createdAt: "2024-03-06T12:00:00Z",
      updatedAt: "2024-03-06T12:00:00Z",
      author: {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        fullName: "Test User",
        avatarUrl: "test.jpg",
      },
    });

    renderWithRouter();

    // Wait for the component to load and get the current user
    await waitFor(() => {
      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    // Find and fill the comment form
    const commentInput = screen.getByPlaceholderText(/write a comment/i);
    const submitButton = screen.getByRole("button", { name: "Post Comment" });

    fireEvent.change(commentInput, { target: { value: "New comment" } });
    fireEvent.click(submitButton);

    // Verify the comment was created
    await waitFor(() => {
      expect(CommentService.createComment).toHaveBeenCalledWith(
        "1",
        "New comment"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Comment posted successfully!"
      );
    });
  });

  it("handles newsletter subscription", async () => {
    renderWithRouter();

    // Wait for the component to load
    await waitFor(() => {
      expect(
        screen.getByText("Subscribe to Our Newsletter")
      ).toBeInTheDocument();
    });

    // Fill in the email and submit
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const subscribeButton = screen.getByText("Subscribe");
    await fireEvent.click(subscribeButton);

    // Verify toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Successfully subscribed to the newsletter!"
      );
    });
  });

  it("handles share functionality", async () => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    renderWithRouter();

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByLabelText(/copy/i)).toBeInTheDocument();
    });

    // Click the copy button
    const copyButton = screen.getByLabelText(/copy/i);
    await fireEvent.click(copyButton);

    // Wait for the async clipboard operation to complete
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Link copied to clipboard!");
    });
  });

  it("handles 404 when trying to access draft post", async () => {
    // Mock a 404 response for a draft post
    vi.mocked(BlogService.getPost).mockRejectedValueOnce({
      response: { status: 404 },
    });

    renderWithRouter();

    // Wait for the error toast to appear
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load blog post");
    });
  });
});
