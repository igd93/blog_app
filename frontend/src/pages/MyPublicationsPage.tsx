import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BlogService } from "@/lib/services/blog.service";
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

export default function MyPublicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [publications, setPublications] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    status: "DRAFT", // Default status
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch user's publications
  useEffect(() => {
    const fetchUserPublications = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Assuming the backend provides an endpoint to get posts by author
        // If not, we'll need to filter the posts on the frontend
        const response = await BlogService.getPosts();
        const userPosts = response.content.filter(
          (post) => post.author.id === user.id
        );
        setPublications(userPosts);
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

  // Handle status select change
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value,
    });
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

      // Create post object
      const newPost: Partial<BlogPost> = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: formData.status,
      };

      // Submit to API
      const createdPost = await BlogService.createPost(newPost);

      // Handle image upload if selected
      // Note: This would require additional backend support for file uploads
      if (selectedImage) {
        // Implement image upload logic here
        // For example: await uploadPostImage(createdPost.id, selectedImage);
        console.log("Image upload would happen here");
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
    if (!selectedPost) return;

    try {
      // Validate form data
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error("Title and content are required.");
        return;
      }

      // Create update object
      const updatedPost: Partial<BlogPost> = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: formData.status,
      };

      // Submit to API
      const result = await BlogService.updatePost(selectedPost.id, updatedPost);

      // Handle image upload if selected
      if (selectedImage) {
        // Implement image upload logic here
        console.log("Image upload would happen here");
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Publication</DialogTitle>
              <DialogDescription>
                Create a new blog post to share with your readers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                  className="min-h-[200px]"
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
                <div className="flex items-center gap-4">
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
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>Create</Button>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Publication</DialogTitle>
            <DialogDescription>
              Make changes to your publication.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                className="min-h-[200px]"
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
              <div className="flex items-center gap-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePost}>Save Changes</Button>
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
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
