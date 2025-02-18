package com.example.blogapp.repository;

import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostOrderByCreatedAtDesc(BlogPost post);

    long countByPost(BlogPost post);
}