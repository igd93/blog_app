package com.example.blogapp.service;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.repository.BlogPostRepository;
import com.example.blogapp.service.impl.BlogPostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogPostServiceTest {

    @Mock
    private BlogPostRepository blogPostRepository;

    @InjectMocks
    private BlogPostServiceImpl blogPostService;

    private BlogPost testPost;
    private User testUser;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        testPost = new BlogPost();
        testPost.setId(testId);
        testPost.setTitle("Test Blog Post");
        testPost.setContent("Test content");
        testPost.setAuthor(testUser);
        testPost.setStatus("DRAFT");
    }

    @Test
    void createPost_WithNewPost_ShouldGenerateSlugAndSave() {
        // Arrange
        when(blogPostRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(testPost);

        // Act
        BlogPost result = blogPostService.createPost(testPost);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getSlug());
        assertTrue(result.getSlug().matches("^[a-z0-9-]+$"));
        verify(blogPostRepository).save(testPost);
    }

    @Test
    void updatePost_WithExistingPost_ShouldSave() {
        // Arrange
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(testPost);

        // Act
        BlogPost result = blogPostService.updatePost(testPost);

        // Assert
        assertNotNull(result);
        assertEquals(testPost.getId(), result.getId());
        verify(blogPostRepository).save(testPost);
    }

    @Test
    void deletePost_WithValidId_ShouldDelete() {
        // Act
        blogPostService.deletePost(testId);

        // Assert
        verify(blogPostRepository).deleteById(testId);
    }

    @Test
    void getPostById_WithValidId_ShouldReturnPost() {
        // Arrange
        when(blogPostRepository.findById(testId)).thenReturn(Optional.of(testPost));

        // Act
        Optional<BlogPost> result = blogPostService.getPostById(testId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testPost.getId(), result.get().getId());
    }

    @Test
    void getPostBySlug_WithValidSlug_ShouldReturnPost() {
        // Arrange
        String slug = "test-blog-post";
        when(blogPostRepository.findBySlug(slug)).thenReturn(Optional.of(testPost));

        // Act
        Optional<BlogPost> result = blogPostService.getPostBySlug(slug);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testPost.getId(), result.get().getId());
    }

    @Test
    void getPostsByAuthor_WithValidAuthor_ShouldReturnPosts() {
        // Arrange
        List<BlogPost> expectedPosts = Arrays.asList(testPost);
        when(blogPostRepository.findByAuthorOrderByPostDateDesc(testUser)).thenReturn(expectedPosts);

        // Act
        List<BlogPost> result = blogPostService.getPostsByAuthor(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testPost.getId(), result.get(0).getId());
    }

    @Test
    void getPostsByStatus_WithValidStatus_ShouldReturnPosts() {
        // Arrange
        String status = "DRAFT";
        List<BlogPost> expectedPosts = Arrays.asList(testPost);
        when(blogPostRepository.findByStatusOrderByPostDateDesc(status)).thenReturn(expectedPosts);

        // Act
        List<BlogPost> result = blogPostService.getPostsByStatus(status);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(status, result.get(0).getStatus());
    }

    @Test
    void getAllPosts_ShouldReturnPageOfPosts() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<BlogPost> posts = Arrays.asList(testPost);
        Page<BlogPost> expectedPage = new PageImpl<>(posts, pageable, posts.size());
        when(blogPostRepository.findAll(pageable)).thenReturn(expectedPage);

        // Act
        Page<BlogPost> result = blogPostService.getAllPosts(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testPost.getId(), result.getContent().get(0).getId());
    }

    @Test
    void existsBySlug_WithValidSlug_ShouldReturnTrue() {
        // Arrange
        String slug = "test-blog-post";
        when(blogPostRepository.existsBySlug(slug)).thenReturn(true);

        // Act
        boolean result = blogPostService.existsBySlug(slug);

        // Assert
        assertTrue(result);
    }

    @Test
    void generateSlug_WithValidTitle_ShouldGenerateValidSlug() {
        // Arrange
        String title = "Test Blog Post! With Special Characters @#$%^&*()";

        // Act
        String slug = blogPostService.generateSlug(title);

        // Assert
        assertNotNull(slug);
        assertTrue(slug.matches("^[a-z0-9-]+$"));
        assertFalse(slug.contains("!"));
        assertFalse(slug.contains("@"));
    }

    @Test
    void generateSlug_WithDuplicateTitle_ShouldGenerateUniqueSlug() {
        // Arrange
        String title = "Test Blog Post";
        when(blogPostRepository.existsBySlug("test-blog-post")).thenReturn(true);
        when(blogPostRepository.existsBySlug("test-blog-post-1")).thenReturn(false);

        // Act
        String slug = blogPostService.generateSlug(title);

        // Assert
        assertNotNull(slug);
        assertEquals("test-blog-post-1", slug);
    }
}