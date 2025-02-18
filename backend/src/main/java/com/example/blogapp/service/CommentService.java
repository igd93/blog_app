package com.example.blogapp.service;

import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentService {
    Comment createComment(Comment comment);

    Comment updateComment(Comment comment);

    void deleteComment(UUID id);

    Optional<Comment> getCommentById(UUID id);

    Page<Comment> getCommentsByPost(BlogPost post, Pageable pageable);

    long getCommentCount(BlogPost post);

    List<Comment> getAllComments();
}