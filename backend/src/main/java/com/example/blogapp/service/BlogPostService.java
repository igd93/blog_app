package com.example.blogapp.service;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.util.BlogPostStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BlogPostService {
    BlogPost createPost(BlogPost post);

    BlogPost updatePost(BlogPost post);

    void deletePost(UUID id);

    Optional<BlogPost> getPostById(UUID id);

    Optional<BlogPost> getPostBySlug(String slug);

    List<BlogPost> getPostsByAuthor(User author);

    List<BlogPost> getPostsByStatus(String status);

    default List<BlogPost> getPostsByStatus(BlogPostStatus status) {
        return getPostsByStatus(status.name());
    }

    Page<BlogPost> getPublishedPosts(Pageable pageable);

    boolean existsBySlug(String slug);

    String generateSlug(String title);

    Page<BlogPost> getAllPosts(Pageable pageable);

    Page<BlogPost> searchPosts(String query, Pageable pageable);
}