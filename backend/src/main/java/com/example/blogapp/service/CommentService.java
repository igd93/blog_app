package com.example.blogapp.service;

import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.BlogPost;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentService {
    Comment createComment(Comment comment);

    Comment updateComment(Comment comment);

    void deleteComment(UUID id);

    Optional<Comment> getCommentById(UUID id);

    List<Comment> getCommentsByPost(BlogPost post);

    long getCommentCount(BlogPost post);

    List<Comment> getAllComments();
}