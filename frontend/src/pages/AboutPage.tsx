import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">About Our Blog</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
          <CardDescription>What drives us forward</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert">
          <p>
            Welcome to our blog platform, where ideas come to life and
            conversations begin. We've created this space to share knowledge,
            foster community discussions, and provide a platform for voices that
            deserve to be heard.
          </p>
          <p>
            Our mission is to deliver high-quality content that informs,
            entertains, and inspires. Whether you're here to learn something
            new, share your expertise, or simply enjoy thoughtful writing, we
            hope you'll find value in what we've built.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>The Team</CardTitle>
          <CardDescription>The people behind the scenes</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert">
          <p>
            Our team consists of passionate writers, developers, and content
            creators dedicated to building a better blogging experience. We
            believe in the power of well-crafted content and intuitive design to
            create meaningful connections.
          </p>
          <p>
            Behind every feature and article is a person committed to excellence
            and continuous improvement. We're always learning, adapting, and
            growing to better serve our community of readers and writers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology</CardTitle>
          <CardDescription>Built with modern tools</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert">
          <p>This blog platform is built with a modern tech stack:</p>
          <ul>
            <li>
              <strong>Frontend:</strong> React, TypeScript, Tailwind CSS
            </li>
            <li>
              <strong>Backend:</strong> Spring Boot, Java
            </li>
            <li>
              <strong>Database:</strong> PostgreSQL
            </li>
            <li>
              <strong>Authentication:</strong> JWT
            </li>
          </ul>
          <p>
            We're committed to performance, security, and accessibility,
            ensuring that our platform works well for everyone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
