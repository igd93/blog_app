import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex justify-center w-full px-4 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">About Our Blog</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>What drives us forward</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              Welcome to our blog platform, where ideas come to life and
              conversations begin. We've created this space to share knowledge,
              foster community discussions, and provide a platform for voices
              that deserve to be heard.
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
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              Our team consists of passionate writers, developers, and content
              creators dedicated to building a better blogging experience. We
              believe in the power of well-crafted content and intuitive design
              to create meaningful connections.
            </p>
            <p>
              Behind every feature and article is a person committed to
              excellence and continuous improvement. We're always learning,
              adapting, and growing to better serve our community of readers and
              writers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
            <CardDescription>Built with modern tools</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p>This blog platform is built with a modern tech stack:</p>
            <ul>
              <li>
                <strong>Frontend:</strong>{" "}
                <span className="inline-flex items-center gap-1">
                  React{" "}
                  <img
                    src="https://cdn.simpleicons.org/react"
                    alt="React"
                    className="w-4 h-4"
                  />
                  , Tailwind CSS{" "}
                  <img
                    src="https://cdn.simpleicons.org/tailwindcss"
                    alt="Tailwind CSS"
                    className="w-4 h-4"
                  />
                </span>
              </li>
              <li>
                <strong>Backend:</strong>{" "}
                <span className="inline-flex items-center gap-1">
                  Spring Boot{" "}
                  <img
                    src="https://cdn.simpleicons.org/springboot"
                    alt="Spring Boot"
                    className="w-4 h-4"
                  />
                </span>
              </li>
              <li>
                <strong>Database:</strong>{" "}
                <span className="inline-flex items-center gap-1">
                  PostgreSQL{" "}
                  <img
                    src="https://cdn.simpleicons.org/postgresql"
                    alt="PostgreSQL"
                    className="w-4 h-4"
                  />
                </span>
              </li>
            </ul>
            <p>
              We're committed to performance, security, and accessibility,
              ensuring that our platform works well for everyone.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
