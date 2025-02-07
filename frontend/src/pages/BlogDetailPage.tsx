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
import { ArrowLeft, Copy } from "lucide-react";
import { SiX, SiFacebook } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
}

// Temporary mock data - replace with actual API call later
const mockBlogPost: BlogPost = {
  id: "1",
  title: "Getting Started with React",
  description:
    "Learn the basics of React and how to build your first application",
  content: `
    React is a powerful JavaScript library for building user interfaces. It allows you to create reusable UI components that manage their own state.

    In this comprehensive guide, we'll cover:
    • Component-Based Architecture
    • JSX Syntax
    • State and Props
    • Hooks and Their Usage
    • Best Practices

    React's component-based architecture makes it easy to build and maintain large applications. Each component is a self-contained module that renders a part of your UI.
    
    The virtual DOM is one of React's most distinctive features. Instead of updating the DOM directly, React creates a virtual representation of the UI in memory and syncs it with the real DOM through a process called reconciliation.
  `,
  author: "John Doe",
  date: "2024-03-20",
  readTime: "5 min read",
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Successfully subscribed to the newsletter!");
    setEmail("");
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = mockBlogPost.title;

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

  useEffect(() => {
    // TODO: Fetch blog post using id
    console.log("Blog post id:", id);
  }, [id]);

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
                <span>{mockBlogPost.author}</span>
                <span>•</span>
                <span>{new Date(mockBlogPost.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{mockBlogPost.readTime}</span>
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
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardTitle className="text-4xl mb-4">
              {mockBlogPost.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {mockBlogPost.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {mockBlogPost.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

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
