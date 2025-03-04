package com.example.blogapp.service;

import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.User;
import com.example.blogapp.repository.CommentRepository;
import com.example.blogapp.service.impl.CommentServiceImpl;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    private Comment testComment;
    private BlogPost testPost;
    private User testUser;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testPost = new BlogPost();
        testPost.setId(UUID.randomUUID());
        testPost.setTitle("Test Post");
        testPost.setContent("Test content");
        testPost.setAuthor(testUser);

        testComment = new Comment();
        testComment.setId(testId);
        testComment.setContent("Test comment");
        testComment.setUser(testUser);
        testComment.setPost(testPost);
        testComment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createComment_WithValidComment_ShouldSaveAndReturnComment() {
        // Arrange
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        // Act
        Comment result = commentService.createComment(testComment);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.getId());
        assertEquals(testComment.getContent(), result.getContent());
        verify(commentRepository).save(testComment);
    }

    @Test
    void updateComment_WithValidComment_ShouldSaveAndReturnUpdatedComment() {
        // Arrange
        String updatedContent = "Updated comment content";
        testComment.setContent(updatedContent);
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        // Act
        Comment result = commentService.updateComment(testComment);

        // Assert
        assertNotNull(result);
        assertEquals(updatedContent, result.getContent());
        verify(commentRepository).save(testComment);
    }

    @Test
    void deleteComment_WithValidId_ShouldDeleteComment() {
        // Act
        commentService.deleteComment(testId);

        // Assert
        verify(commentRepository).deleteById(testId);
    }

    @Test
    void getCommentById_WithExistingId_ShouldReturnComment() {
        // Arrange
        when(commentRepository.findById(testId)).thenReturn(Optional.of(testComment));

        // Act
        Optional<Comment> result = commentService.getCommentById(testId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testId, result.get().getId());
        assertEquals(testComment.getContent(), result.get().getContent());
    }

    @Test
    void getCommentById_WithNonExistingId_ShouldReturnEmpty() {
        // Arrange
        when(commentRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        Optional<Comment> result = commentService.getCommentById(testId);

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void getCommentsByPost_ShouldReturnPageOfComments() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Comment> comments = Arrays.asList(testComment);
        Page<Comment> commentPage = new PageImpl<>(comments, pageable, comments.size());
        when(commentRepository.findByPost(testPost, pageable)).thenReturn(commentPage);

        // Act
        Page<Comment> result = commentService.getCommentsByPost(testPost, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testComment.getId(), result.getContent().get(0).getId());
        assertEquals(testComment.getContent(), result.getContent().get(0).getContent());
    }

    @Test
    void getCommentCount_ShouldReturnNumberOfComments() {
        // Arrange
        long expectedCount = 5L;
        when(commentRepository.countByPost(testPost)).thenReturn(expectedCount);

        // Act
        long result = commentService.getCommentCount(testPost);

        // Assert
        assertEquals(expectedCount, result);
    }

    @Test
    void getAllComments_ShouldReturnAllComments() {
        // Arrange
        List<Comment> expectedComments = Arrays.asList(testComment);
        when(commentRepository.findAll()).thenReturn(expectedComments);

        // Act
        List<Comment> result = commentService.getAllComments();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testComment.getId(), result.get(0).getId());
        assertEquals(testComment.getContent(), result.get(0).getContent());
    }
}