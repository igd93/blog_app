import { useState, useCallback, useEffect } from "react";
import { CommentService } from "@/lib/services/comment.service";
import { Comment } from "@/lib/types/api";

interface UseCommentsResult {
  comments: Comment[];
  totalComments: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  fetchComments: (
    page?: number,
    size?: number,
    sortBy?: string,
    direction?: string
  ) => Promise<void>;
  createComment: (content: string) => Promise<Comment>;
  updateComment: (id: string, content: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
}

export function useComments(postId: string): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch comments for the post
  const fetchComments = useCallback(
    async (
      page = 0,
      size = 10,
      sortBy = "createdAt",
      direction = "desc"
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await CommentService.getPostComments(
          postId,
          page,
          size,
          sortBy,
          direction
        );
        setComments(response.content);
        setTotalComments(response.totalElements);
        setTotalPages(response.totalPages);
        setCurrentPage(response.number);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch comments");
        setError(error);
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [postId]
  );

  // Create a new comment
  const createComment = useCallback(
    async (content: string): Promise<Comment> => {
      setIsLoading(true);
      setError(null);

      try {
        const newComment = await CommentService.createComment(postId, content);

        // Update the comments list with the new comment
        setComments((prevComments) => [newComment, ...prevComments]);
        setTotalComments((prev) => prev + 1);

        return newComment;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create comment");
        setError(error);
        console.error("Error creating comment:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [postId]
  );

  // Update an existing comment
  const updateComment = useCallback(
    async (id: string, content: string): Promise<Comment> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedComment = await CommentService.updateComment(id, content);

        // Update the comments list with the updated comment
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === id ? updatedComment : comment
          )
        );

        return updatedComment;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update comment");
        setError(error);
        console.error("Error updating comment:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete a comment
  const deleteComment = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await CommentService.deleteComment(id);

      // Remove the deleted comment from the list
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== id)
      );
      setTotalComments((prev) => prev - 1);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete comment");
      setError(error);
      console.error("Error deleting comment:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    totalComments,
    totalPages,
    currentPage,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
}
