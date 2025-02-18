package com.example.blogapp.controller;

import com.example.blogapp.dto.BlogPostDTO;
import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.mapper.BlogPostMapper;
import com.example.blogapp.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class BlogPostController {
    private final BlogPostService blogPostService;
    private final BlogPostMapper blogPostMapper;

    @GetMapping
    public ResponseEntity<Page<BlogPostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
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
}