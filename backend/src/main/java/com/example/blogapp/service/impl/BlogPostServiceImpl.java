package com.example.blogapp.service.impl;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.repository.BlogPostRepository;
import com.example.blogapp.service.BlogPostService;
import com.example.blogapp.util.BlogPostStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Locale;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogPostServiceImpl implements BlogPostService {
    private final BlogPostRepository blogPostRepository;

    @Override
    public BlogPost createPost(BlogPost post) {
        if (post.getSlug() == null || post.getSlug().isEmpty()) {
            post.setSlug(generateSlug(post.getTitle()));
        }
        if (post.getPostDate() == null) {
            post.setPostDate(LocalDateTime.now());
        }
        if (post.getReadTime() == null || post.getReadTime().isEmpty()) {
            post.setReadTime(calculateReadTime(post.getContent()));
        }
        return blogPostRepository.save(post);
    }

    @Override
    public BlogPost updatePost(BlogPost post) {
        // Ensure postDate is never null during updates
        if (post.getPostDate() == null) {
            post.setPostDate(LocalDateTime.now());
        }
        if (post.getReadTime() == null || post.getReadTime().isEmpty()) {
            post.setReadTime(calculateReadTime(post.getContent()));
        }
        return blogPostRepository.save(post);
    }

    @Override
    public void deletePost(UUID id) {
        blogPostRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BlogPost> getPostById(UUID id) {
        return blogPostRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BlogPost> getPostBySlug(String slug) {
        return blogPostRepository.findBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogPost> getPostsByAuthor(User author) {
        return blogPostRepository.findByAuthorOrderByPostDateDesc(author);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogPost> getPostsByStatus(String status) {
        // Convert string to enum
        try {
            BlogPostStatus postStatus = BlogPostStatus.valueOf(status);
            return blogPostRepository.findByStatusOrderByPostDateDesc(postStatus);
        } catch (IllegalArgumentException e) {
            // Log error and return empty list for invalid status
            System.err.println("Invalid status value: " + status);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getAllPosts(Pageable pageable) {
        return blogPostRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        return blogPostRepository.existsBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> searchPosts(String query, Pageable pageable) {
        return blogPostRepository.searchPosts(query, BlogPostStatus.PUBLISHED, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPublishedPosts(Pageable pageable) {
        System.out.println("Filtering posts for status: " + BlogPostStatus.PUBLISHED);
        // Use the enum
        Page<BlogPost> result = blogPostRepository.findByStatus(BlogPostStatus.PUBLISHED, pageable);

        System.out.println("Found " + result.getTotalElements() + " published posts");

        // List all blog posts for debugging
        System.out.println("Listing all blog posts in database:");
        blogPostRepository.findAll().forEach(post -> {
            System.out.println("ID: " + post.getId() + ", Title: " + post.getTitle() + ", Status: " + post.getStatus());
        });

        return result;
    }

    @Override
    public String generateSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();

        // Handle duplicate slugs by appending a number if necessary
        String baseSlug = slug;
        int counter = 1;
        while (existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    /**
     * Calculate estimated reading time based on content length.
     * Average reading speed is about 200-250 words per minute.
     * 
     * @param content The post content
     * @return Formatted read time string (e.g., "3 min")
     */
    private String calculateReadTime(String content) {
        if (content == null || content.isEmpty()) {
            return "1 min";
        }

        // Count words (roughly by splitting on whitespace)
        String[] words = content.split("\\s+");
        int wordCount = words.length;

        // Calculate minutes based on average reading speed of 200 words per minute
        int minutes = Math.max(1, (int) Math.ceil(wordCount / 200.0));

        return minutes + " min";
    }

}