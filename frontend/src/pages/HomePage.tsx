import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
}

// Temporary mock data - replace with actual API call later
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with React",
    description:
      "Learn the basics of React and how to build your first application",
    author: "John Doe",
    date: "2024-03-20",
  },
  {
    id: "2",
    title: "Understanding TypeScript",
    description: "A comprehensive guide to TypeScript and its features",
    author: "Jane Smith",
    date: "2024-03-19",
  },
  // Add more mock posts as needed
];

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>

      <ScrollArea className="h-[800px] w-full rounded-md border p-4">
        <div className="grid gap-4">
          {mockBlogPosts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:bg-accent">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  By {post.author} • {new Date(post.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{post.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
