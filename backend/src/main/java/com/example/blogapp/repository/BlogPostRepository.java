package com.example.blogapp.repository;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {
    List<BlogPost> findByAuthorOrderByPostDateDesc(User author);

    Optional<BlogPost> findBySlug(String slug);

    List<BlogPost> findByStatusOrderByPostDateDesc(String status);

    boolean existsBySlug(String slug);

    @Query("SELECT p FROM blog_post p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<BlogPost> searchPosts(@Param("query") String query, Pageable pageable);
}