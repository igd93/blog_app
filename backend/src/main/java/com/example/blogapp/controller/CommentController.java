package com.example.blogapp.controller;

import com.example.blogapp.dto.CommentDTO;
import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.CommentMapper;
import com.example.blogapp.service.CommentService;
import com.example.blogapp.service.BlogPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    private final CommentService commentService;
    private final BlogPostService blogPostService;
    private final CommentMapper commentMapper;

    @GetMapping("/api/posts/{postId}/comments")
    public ResponseEntity<Page<CommentDTO>> getPostComments(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return blogPostService.getPostById(postId)
                .map(post -> {
                    Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
                    PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
                    Page<CommentDTO> comments = commentService.getCommentsByPost(post, pageRequest)
                            .map(commentMapper::toDTO);
                    return ResponseEntity.ok(comments);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CommentDTO commentDTO,
            @AuthenticationPrincipal User currentUser) {

        // Log authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Authentication details: isAuthenticated={}, principal={}, authorities={}",
                auth != null && auth.isAuthenticated(),
                auth != null ? auth.getPrincipal() : "null",
                auth != null ? auth.getAuthorities() : "null");

        if (currentUser == null) {
            log.error("Current user is null, authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Creating comment for post {} by user {}", postId, currentUser.getUsername());
        log.info("Comment content: {}", commentDTO.getContent());

        return blogPostService.getPostById(postId)
                .map(post -> {
                    try {
                        // Create a new comment directly instead of using the mapper
                        Comment comment = new Comment();
                        comment.setContent(commentDTO.getContent());
                        comment.setPost(post);
                        comment.setUser(currentUser);

                        Comment savedComment = commentService.createComment(comment);
                        log.info("Comment created successfully with ID: {}", savedComment.getId());

                        return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(commentMapper.toDTO(savedComment));
                    } catch (Exception e) {
                        log.error("Error creating comment: ", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<CommentDTO>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/comments/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentDTO commentDTO) {

        return commentService.getCommentById(id)
                .map(existingComment -> {
                    Comment comment = commentMapper.toEntity(commentDTO);
                    comment.setId(id);
                    comment.setPost(existingComment.getPost());
                    comment.setUser(existingComment.getUser());
                    Comment updatedComment = commentService.updateComment(comment);
                    return ResponseEntity.ok(commentMapper.toDTO(updatedComment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        return commentService.getCommentById(id)
                .map(comment -> {
                    commentService.deleteComment(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/comments/test-auth")
    public ResponseEntity<String> testAuth(@AuthenticationPrincipal User currentUser) {
        // Log authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Test Auth - Authentication details: isAuthenticated={}, principal={}, authorities={}",
                auth != null && auth.isAuthenticated(),
                auth != null ? auth.getPrincipal() : "null",
                auth != null ? auth.getAuthorities() : "null");

        if (currentUser != null) {
            log.info("Authentication test successful for user: {}", currentUser.getUsername());
            return ResponseEntity.ok("Authentication successful for user: " + currentUser.getUsername());
        } else {
            log.warn("Authentication test failed: No authenticated user found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authenticated user found");
        }
    }
}