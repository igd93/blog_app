import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BlogService } from "@/lib/services/blog.service";
import { FileService } from "@/lib/services/file.service";
import { BlogPost } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, FileImage } from "lucide-react";

type BlogPostStatus = "PUBLISHED" | "DRAFT";

type FormData = {
  title: string;
  description: string;
  content: string;
  status: BlogPostStatus;
};

export default function MyPublicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [publications, setPublications] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    content: "",
    status: "DRAFT", // Default status
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Fetch user's publications
  useEffect(() => {
    const fetchUserPublications = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Use the new method to get posts by author
        const userPosts = await BlogService.getPostsByAuthor(user.id);
        setPublications(userPosts);

        // Get presigned URLs for all post images
        const urls: Record<string, string> = {};
        for (const post of userPosts) {
          if (post.imageUrl) {
            try {
              const url = await FileService.getPostImageUrl(post.id);
              urls[post.id] = url;
            } catch (error) {
              console.error(
                `Failed to get presigned URL for post ${post.id}:`,
                error
              );
            }
          }
        }
        setImageUrls(urls);
      } catch (error) {
        console.error("Failed to fetch publications:", error);
        toast.error("Failed to load your publications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPublications();
  }, [user]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle status select change (accept string but validate it's a valid status)
  const handleStatusChange = (value: string) => {
    // Validate that the value is a valid BlogPostStatus
    if (value === "PUBLISHED" || value === "DRAFT") {
      setFormData({
        ...formData,
        status: value,
      });
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      status: "DRAFT",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedPost(null);
  };

  // Open edit dialog with post data
  const handleEditClick = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      description: post.description || "",
      content: post.content,
      status: post.status,
    });
    // Reset image states when opening edit dialog
    setSelectedImage(null);
    setImagePreview(null);
    setOpenEditDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (post: BlogPost) => {
    setSelectedPost(post);
    setOpenDeleteDialog(true);
  };

  // Create new post
  const handleCreatePost = async () => {
    try {
      // Validate form data
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error("Title and content are required.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to create a publication.");
        return;
      }

      // Create post object
      const newPost: Partial<BlogPost> = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: formData.status,
        author: user,
      };

      // Submit to API
      let createdPost = await BlogService.createPost(newPost);

      // Handle image upload if selected
      if (selectedImage) {
        try {
          const imageUrl = await FileService.uploadPostImage(
            createdPost.id,
            selectedImage
          );
          console.log("Image uploaded successfully:", imageUrl);

          // Refresh the post data to get the updated imageUrl
          createdPost = await BlogService.getPost(createdPost.id);

          // Get a presigned URL for the image
          if (createdPost.imageUrl) {
            const presignedUrl = await FileService.getPostImageUrl(
              createdPost.id
            );
            setImageUrls((prev) => ({
              ...prev,
              [createdPost.id]: presignedUrl,
            }));
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          toast.error("Publication created but failed to upload image.");
        }
      }

      // Update local state
      setPublications([createdPost, ...publications]);

      // Close dialog and reset form
      setOpenCreateDialog(false);
      resetForm();

      toast.success("Publication created successfully!");
    } catch (error) {
      console.error("Failed to create publication:", error);
      toast.error("Failed to create publication. Please try again.");
    }
  };

  // Update existing post
  const handleUpdatePost = async () => {
    if (!selectedPost) {
      console.error("No post selected for update");
      toast.error("No post selected for update");
      return;
    }

    try {
      // Validate form data
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error("Title and content are required.");
        return;
      }

      console.log("handleUpdatePost - Selected Post:", selectedPost);
      console.log("handleUpdatePost - Form Data:", formData);

      // Create update object
      const updatedPost: Partial<BlogPost> = {
        id: selectedPost.id,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: formData.status,
        // Preserve the original author
        author: selectedPost.author,
        // Preserve other fields
        slug: selectedPost.slug,
        postDate: selectedPost.postDate,
        readTime: selectedPost.readTime,
        imageUrl: selectedPost.imageUrl,
        tags: selectedPost.tags,
      };

      console.log("handleUpdatePost - Update Object:", updatedPost);

      // Submit to API
      let result = await BlogService.updatePost(selectedPost.id, updatedPost);
      console.log("handleUpdatePost - API Response:", result);

      // Handle image upload if selected
      if (selectedImage) {
        try {
          console.log("Uploading image for post:", result.id);
          const imageUrl = await FileService.uploadPostImage(
            result.id,
            selectedImage
          );
          console.log("Image uploaded successfully:", imageUrl);

          // Refresh the post data to get the updated imageUrl
          result = await BlogService.getPost(result.id);

          // Get a presigned URL for the image
          if (result.imageUrl) {
            const presignedUrl = await FileService.getPostImageUrl(result.id);
            setImageUrls((prev) => ({
              ...prev,
              [result.id]: presignedUrl,
            }));
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          toast.error("Publication updated but failed to upload image.");
        }
      } else if (result.imageUrl) {
        // If no new image was selected but the post has an image, update the URL in our cache
        try {
          const presignedUrl = await FileService.getPostImageUrl(result.id);
          setImageUrls((prev) => ({
            ...prev,
            [result.id]: presignedUrl,
          }));
        } catch (error) {
          console.error(
            "Failed to get presigned URL for existing image:",
            error
          );
        }
      }

      // Update local state
      setPublications(
        publications.map((post) =>
          post.id === selectedPost.id ? result : post
        )
      );

      // Close dialog and reset form
      setOpenEditDialog(false);
      resetForm();

      toast.success("Publication updated successfully!");
    } catch (error) {
      console.error("Failed to update publication:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      toast.error("Failed to update publication. Please try again.");
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      // Submit to API
      await BlogService.deletePost(selectedPost.id);

      // Update local state
      setPublications(
        publications.filter((post) => post.id !== selectedPost.id)
      );

      // Close dialog
      setOpenDeleteDialog(false);

      toast.success("Publication deleted successfully!");
    } catch (error) {
      console.error("Failed to delete publication:", error);
      toast.error("Failed to delete publication. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get the image URL for a post (either presigned or direct)
  const getPostImageUrl = (post: BlogPost) => {
    return imageUrls[post.id] || post.imageUrl;
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-10 text-center">
        <p>Please log in to view your publications.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Publications</h1>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Publication</DialogTitle>
              <DialogDescription>
                Create a new blog post to share with your readers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a title for your post"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your post"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your post content here..."
                  className="min-h-[150px] max-h-[200px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Featured Image (optional)</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <FileImage size={16} />
                    Select Image
                  </Button>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="relative w-16 h-16">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2 sm:mt-4 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenCreateDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePost} className="w-full sm:w-auto">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading your publications...</div>
      ) : publications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            You haven't created any publications yet.
          </p>
          <Button
            onClick={() => setOpenCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create Your First Publication
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {publications.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>
                      {formatDate(post.postDate)} • {post.readTime} read
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(post)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(post)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={getPostImageUrl(post)}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
                <p className="line-clamp-2 text-muted-foreground">
                  {post.description || post.content.substring(0, 150)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      post.status === "PUBLISHED"
                        ? "text-green-600 font-medium"
                        : "text-amber-600 font-medium"
                    }
                  >
                    {post.status}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Publication</DialogTitle>
            <DialogDescription>
              Make changes to your publication.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="min-h-[150px] max-h-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Featured Image (optional)</Label>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("edit-image")?.click()}
                  className="flex items-center gap-2"
                >
                  <FileImage size={16} />
                  Select Image
                </Button>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative w-16 h-16">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  selectedPost?.imageUrl && (
                    <div className="relative w-16 h-16">
                      <img
                        src={getPostImageUrl(selectedPost)}
                        alt="Current image"
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="text-xs mt-1">Current image</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2 sm:mt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePost} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this publication? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
