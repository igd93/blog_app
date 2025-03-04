package com.example.blogapp.controller;

import com.example.blogapp.config.TestSecurityConfig;
import com.example.blogapp.dto.CommentDTO;
import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.Comment;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.CommentMapper;
import com.example.blogapp.service.BlogPostService;
import com.example.blogapp.service.CommentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommentService commentService;

    @MockBean
    private BlogPostService blogPostService;

    @MockBean
    private CommentMapper commentMapper;

    private CommentDTO commentDTO;
    private Comment comment;
    private BlogPost blogPost;
    private User testUser;
    private UserDTO testUserDTO;
    private UUID testCommentId;
    private UUID testPostId;

    @BeforeEach
    void setUp() {
        testCommentId = UUID.randomUUID();
        testPostId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        testUserDTO = UserDTO.builder()
                .id(testUser.getId())
                .username("testuser")
                .build();

        blogPost = new BlogPost();
        blogPost.setId(testPostId);
        blogPost.setTitle("Test Post");

        comment = new Comment();
        comment.setId(testCommentId);
        comment.setContent("Test comment");
        comment.setUser(testUser);
        comment.setPost(blogPost);
        comment.setCreatedAt(LocalDateTime.now());

        commentDTO = CommentDTO.builder()
                .id(testCommentId)
                .content("Test comment")
                .author(testUserDTO)
                .postId(testPostId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getPostComments_WithValidPostId_ShouldReturnComments() throws Exception {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Comment> commentPage = new PageImpl<>(Arrays.asList(comment));

        when(blogPostService.getPostById(testPostId)).thenReturn(Optional.of(blogPost));
        when(commentService.getCommentsByPost(any(BlogPost.class), any(PageRequest.class)))
                .thenReturn(commentPage);
        when(commentMapper.toDTO(comment)).thenReturn(commentDTO);

        // Act & Assert
        mockMvc.perform(get("/api/posts/{postId}/comments", testPostId)
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "createdAt")
                .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(testCommentId.toString()))
                .andExpect(jsonPath("$.content[0].content").value("Test comment"));

        verify(commentService).getCommentsByPost(any(BlogPost.class), any(PageRequest.class));
        verify(commentMapper).toDTO(comment);
    }

    @Test
    void getPostComments_WithInvalidPostId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testPostId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/posts/{postId}/comments", testPostId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createComment_WithValidData_ShouldReturnCreatedComment() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testPostId)).thenReturn(Optional.of(blogPost));
        when(commentMapper.toEntity(any(CommentDTO.class))).thenReturn(comment);
        when(commentService.createComment(any(Comment.class))).thenReturn(comment);
        when(commentMapper.toDTO(comment)).thenReturn(commentDTO);

        // Act & Assert
        mockMvc.perform(post("/api/posts/{postId}/comments", testPostId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Test comment"));

        verify(commentMapper).toEntity(any(CommentDTO.class));
        verify(commentService).createComment(any(Comment.class));
        verify(commentMapper).toDTO(comment);
    }

    @Test
    void createComment_WithInvalidPostId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testPostId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/api/posts/{postId}/comments", testPostId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateComment_WithValidData_ShouldReturnUpdatedComment() throws Exception {
        // Arrange
        when(commentService.getCommentById(testCommentId)).thenReturn(Optional.of(comment));
        when(commentMapper.toEntity(any(CommentDTO.class))).thenReturn(comment);
        when(commentService.updateComment(any(Comment.class))).thenReturn(comment);
        when(commentMapper.toDTO(comment)).thenReturn(commentDTO);

        // Act & Assert
        mockMvc.perform(put("/api/comments/{id}", testCommentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testCommentId.toString()))
                .andExpect(jsonPath("$.content").value("Test comment"));
    }

    @Test
    void updateComment_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(commentService.getCommentById(testCommentId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/comments/{id}", testCommentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteComment_WithExistingId_ShouldReturnNoContent() throws Exception {
        // Arrange
        when(commentService.getCommentById(testCommentId)).thenReturn(Optional.of(comment));

        // Act & Assert
        mockMvc.perform(delete("/api/comments/{id}", testCommentId))
                .andExpect(status().isNoContent());

        verify(commentService).deleteComment(testCommentId);
    }

    @Test
    void deleteComment_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(commentService.getCommentById(testCommentId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(delete("/api/comments/{id}", testCommentId))
                .andExpect(status().isNotFound());

        verify(commentService, never()).deleteComment(any());
    }
}