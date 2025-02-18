package com.example.blogapp.repository;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {
    List<BlogPost> findByAuthorOrderByPostDateDesc(User author);

    Optional<BlogPost> findBySlug(String slug);

    List<BlogPost> findByStatusOrderByPostDateDesc(String status);

    boolean existsBySlug(String slug);
}