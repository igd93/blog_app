import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Send } from "lucide-react";
import { SiX, SiFacebook } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";
import { BlogService } from "@/lib/services/blog.service";
import { CommentService } from "@/lib/services/comment.service";
import { AuthService } from "@/lib/services/auth.service";
import { BlogPost, Comment, User } from "@/lib/types/api";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const isAuthenticated = AuthService.isAuthenticated();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch blog post and comments
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [postData, commentsData] = await Promise.all([
          BlogService.getPost(id),
          CommentService.getPostComments(id),
        ]);
        setPost(postData);
        setComments(commentsData.content);
      } catch (err: unknown) {
        console.error("Failed to load blog post:", err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          toast.error("This post doesn't exist or has been unpublished");
        } else {
          toast.error("Failed to load blog post");
        }
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Calculate reading progress
  useEffect(() => {
    const calculateReadingProgress = () => {
      const element = document.documentElement;
      const scrollTop = element.scrollTop || document.body.scrollTop;
      const scrollHeight = element.scrollHeight || document.body.scrollHeight;
      const clientHeight = element.clientHeight;
      const windowHeight = scrollHeight - clientHeight;
      const progress = Math.round((scrollTop / windowHeight) * 100);
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", calculateReadingProgress);
    return () => window.removeEventListener("scroll", calculateReadingProgress);
  }, []);

  // Fetch current user if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      AuthService.getCurrentUser()
        .then((user) => {
          console.log("Current user fetched:", user);
          setCurrentUser(user);

          // Test authentication with backend
          CommentService.testAuth()
            .then((result) => console.log("Auth test result:", result))
            .catch((err) => console.error("Auth test failed:", err));
        })
        .catch((err) => console.error("Failed to fetch current user:", err));
    }
  }, [isAuthenticated]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Successfully subscribed to the newsletter!");
    setEmail("");
  };

  const handleShare = async (platform: string) => {
    if (!post) return;
    const url = window.location.href;
    const title = post.title;

    switch (platform) {
      case "x":
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // Check authentication status
      if (!isAuthenticated) {
        toast.error("You must be logged in to comment");
        navigate("/login");
        return;
      }

      // Make sure we have the current user
      if (!currentUser) {
        try {
          console.log("Fetching current user before submitting comment");
          const user = await AuthService.getCurrentUser();
          console.log("Current user fetched successfully:", user);
          setCurrentUser(user);
        } catch (err) {
          console.error("Failed to get current user:", err);
          toast.error("Please log in again to comment");
          // Force re-authentication
          AuthService.logout().then(() => navigate("/login"));
          setIsSubmittingComment(false);
          return;
        }
      }

      console.log("Submitting comment with content:", newComment);
      const comment = await CommentService.createComment(id, newComment);
      console.log("Comment submitted successfully:", comment);

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err: unknown) {
      console.error("Failed to post comment:", err);

      // More detailed error handling
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorMessage = err.response?.data?.message || "Unknown error";

        console.error(`API Error (${status}):`, errorMessage);

        if (status === 401) {
          toast.error("Your session has expired. Please log in again.");
          navigate("/login");
        } else if (status === 400) {
          toast.error(`Invalid comment: ${errorMessage}`);
        } else {
          toast.error(`Failed to post comment: ${errorMessage}`);
        }
      } else {
        toast.error("Failed to post comment. Please try again later.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        ></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <Progress
        value={readingProgress}
        className="fixed top-0 left-0 right-0 z-50 h-1 rounded-none"
      />

      <div className="container mx-auto py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{post.author.fullName}</span>
                <span>•</span>
                <span>{new Date(post.postDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare("x")}
                >
                  <SiX className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare("facebook")}
                >
                  <SiFacebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare("copy")}
                  aria-label="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardTitle className="text-4xl mb-4">{post.title}</CardTitle>
            <CardDescription className="text-lg">
              {post.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {post.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-8">
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

        <Separator className="my-8" />

        {/* Comments Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  required
                  disabled={isSubmittingComment}
                />
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                  disabled={isSubmittingComment}
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">
                  Please log in to comment
                </p>
                <Button onClick={() => navigate("/login")}>Log In</Button>
              </div>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={comment.author.avatarUrl}
                      alt={comment.author.fullName}
                    />
                    <AvatarFallback>
                      {comment.author.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {comment.author.fullName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-left">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to Our Newsletter</CardTitle>
            <CardDescription>
              Get the latest blog posts delivered directly to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
