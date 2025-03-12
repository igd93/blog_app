import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BlogService } from "@/lib/services/blog.service";
import { BlogPost, PaginatedResponse } from "@/lib/types/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "0");

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PaginatedResponse<BlogPost> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await BlogService.searchPosts(query, page, 10);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, page]);

  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        {query ? `Search Results for "${query}"` : "Search Results"}
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">{error}</div>
      ) : !results || results.content.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground mb-6">
            Try different keywords or check your spelling
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {results.content.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link to={`/blog/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-2">
                    {post.description || "No description available"}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{formatDate(post.postDate)}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/blog/${post.id}`}>Read more</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {results.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(0, page - 1))}
                    disabled={page === 0}
                  />
                </PaginationItem>

                {[...Array(Math.min(5, results.totalPages))].map((_, i) => {
                  const pageNumber = i + Math.max(0, page - 2);
                  if (pageNumber >= results.totalPages) return null;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pageNumber === page}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= results.totalPages - 1}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
