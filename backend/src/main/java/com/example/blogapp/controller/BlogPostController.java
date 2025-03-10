package com.example.blogapp.controller;

import com.example.blogapp.dto.BlogPostDTO;
import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.BlogPostMapper;
import com.example.blogapp.service.BlogPostService;
import com.example.blogapp.service.FileStorageService;
import com.example.blogapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class BlogPostController {
    private final BlogPostService blogPostService;
    private final UserService userService;
    private final BlogPostMapper blogPostMapper;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<BlogPostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be less than zero");
        }
        if (size < 1) {
            throw new IllegalArgumentException("Page size must not be less than one");
        }

        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid value '" + direction
                    + "' for orders given; Has to be either 'desc' or 'asc' (case insensitive)");
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<BlogPostDTO> posts = blogPostService.getAllPosts(pageRequest)
                .map(blogPostMapper::toDTO);

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDTO> getPostById(@PathVariable UUID id) {
        return blogPostService.getPostById(id)
                .map(blogPostMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BlogPostDTO> createPost(@Valid @RequestBody BlogPostDTO postDTO) {
        BlogPost post = blogPostMapper.toEntity(postDTO);
        BlogPost savedPost = blogPostService.createPost(post);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(blogPostMapper.toDTO(savedPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostDTO> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody BlogPostDTO postDTO) {
        return blogPostService.getPostById(id)
                .map(existingPost -> {
                    postDTO.setId(id);
                    BlogPost post = blogPostMapper.toEntity(postDTO);
                    BlogPost updatedPost = blogPostService.updatePost(post);
                    return ResponseEntity.ok(blogPostMapper.toDTO(updatedPost));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        if (blogPostService.getPostById(id).isPresent()) {
            blogPostService.deletePost(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<BlogPostDTO>> getPostsByAuthor(@PathVariable UUID authorId) {
        return userService.getUserById(authorId)
                .map(author -> {
                    List<BlogPost> posts = blogPostService.getPostsByAuthor(author);
                    List<BlogPostDTO> postDTOs = posts.stream()
                            .map(blogPostMapper::toDTO)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(postDTOs);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPostImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {

        return blogPostService.getPostById(id)
                .map(post -> {
                    try {
                        // Store the file in MinIO under the posts/{id} path
                        String imageUrl = fileStorageService.storeFile(file, "posts/" + id);

                        // Update the post with the image URL
                        post.setImageUrl(imageUrl);
                        blogPostService.updatePost(post);

                        Map<String, String> response = new HashMap<>();
                        response.put("imageUrl", imageUrl);

                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        Map<String, String> errorResponse = new HashMap<>();
                        errorResponse.put("error", e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                    }
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/image/url")
    public ResponseEntity<Map<String, String>> getPostImageUrl(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "60") int expiryMinutes) {

        return blogPostService.getPostById(id)
                .map(post -> {
                    try {
                        if (post.getImageUrl() == null || post.getImageUrl().isEmpty()) {
                            Map<String, String> notFoundResponse = new HashMap<>();
                            notFoundResponse.put("error", "Image not found");
                            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(notFoundResponse);
                        }

                        // Get a presigned URL for the image
                        String presignedUrl = fileStorageService.getPresignedUrl(post.getImageUrl(), expiryMinutes);

                        Map<String, String> response = new HashMap<>();
                        response.put("imageUrl", presignedUrl);

                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        Map<String, String> errorResponse = new HashMap<>();
                        errorResponse.put("error", e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                    }
                })
                .orElseGet(() -> {
                    Map<String, String> notFoundResponse = new HashMap<>();
                    notFoundResponse.put("error", "Post not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(notFoundResponse);
                });
    }
}