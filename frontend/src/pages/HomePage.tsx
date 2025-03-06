import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { BlogService } from "@/lib/services/blog.service";
import { BlogPost, ApiError } from "@/lib/types/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum: number) => {
    try {
      const response = await BlogService.getPosts(pageNum);
      if (pageNum === 0) {
        setPosts(response.content);
      } else {
        setPosts((prev) => [...prev, ...response.content]);
      }
      setHasMore(!response.last);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        toast.error(
          axiosError.response?.data?.message || "Failed to fetch blog posts"
        );
      } else {
        toast.error("An unexpected error occurred while fetching posts");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const loadMore = () => {
    const currentPage = Math.ceil(posts.length / 10);
    fetchPosts(currentPage);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
        <div className="flex justify-center items-center h-[400px]">
          <div
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>

      <ScrollArea className="h-[800px] w-full rounded-md border p-4">
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              data-testid={`post-card-${post.id}`}
              className="cursor-pointer hover:bg-accent"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  By {post.author.fullName} •{" "}
                  {new Date(post.postDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{post.description || post.content.substring(0, 150)}...</p>
                {post.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-sm bg-secondary px-2 py-1 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
