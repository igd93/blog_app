package com.example.blogapp.service.impl;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.repository.BlogPostRepository;
import com.example.blogapp.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Locale;
import java.util.regex.Pattern;

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
        return blogPostRepository.save(post);
    }

    @Override
    public BlogPost updatePost(BlogPost post) {
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
        return blogPostRepository.findByStatusOrderByPostDateDesc(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        return blogPostRepository.existsBySlug(slug);
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
}