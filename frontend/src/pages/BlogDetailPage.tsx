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
import { useState } from "react";
import { useParams } from "react-router-dom";

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
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribing with email:", email);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
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
          </div>
          <CardTitle className="text-4xl mb-4">{mockBlogPost.title}</CardTitle>
          <CardDescription className="text-lg">
            {mockBlogPost.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none">
            {mockBlogPost.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

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
  );
}
