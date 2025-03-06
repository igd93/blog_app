import { useState, useEffect, useCallback } from "react";
import { BlogService } from "@/lib/services/blog.service";
import { BlogPost } from "@/lib/types/api";

interface UseBlogPostsResult {
  posts: BlogPost[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBlogPosts(
  initialPage = 0,
  pageSize = 10,
  sortBy = "postDate",
  direction = "desc"
): UseBlogPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await BlogService.getPosts(
          pageNum,
          pageSize,
          sortBy,
          direction
        );

        if (reset) {
          setPosts(response.content);
        } else {
          setPosts((prev) => [...prev, ...response.content]);
        }

        setHasMore(!response.last);
        return response;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch blog posts");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, sortBy, direction]
  );

  // Initial load
  useEffect(() => {
    fetchPosts(initialPage, true).catch((err) => {
      console.error("Error in initial blog posts fetch:", err);
    });
  }, [fetchPosts, initialPage]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      await fetchPosts(nextPage);
      setPage(nextPage);
    }
  }, [fetchPosts, isLoading, hasMore, page]);

  // Refresh posts
  const refresh = useCallback(async () => {
    setPage(initialPage);
    await fetchPosts(initialPage, true);
  }, [fetchPosts, initialPage]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
