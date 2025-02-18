package com.example.blogapp.controller;

import com.example.blogapp.dto.CommentDTO;
import com.example.blogapp.entity.Comment;
import com.example.blogapp.mapper.CommentMapper;
import com.example.blogapp.service.CommentService;
import com.example.blogapp.service.BlogPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
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
            @Valid @RequestBody CommentDTO commentDTO) {

        return blogPostService.getPostById(postId)
                .map(post -> {
                    Comment comment = commentMapper.toEntity(commentDTO);
                    comment.setPost(post);
                    Comment savedComment = commentService.createComment(comment);
                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(commentMapper.toDTO(savedComment));
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
}