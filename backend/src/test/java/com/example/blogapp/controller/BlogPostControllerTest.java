package com.example.blogapp.controller;

import com.example.blogapp.config.TestSecurityConfig;
import com.example.blogapp.dto.BlogPostDTO;
import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.BlogPost;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.BlogPostMapper;
import com.example.blogapp.service.BlogPostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@WebMvcTest(BlogPostController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class BlogPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BlogPostService blogPostService;

    @MockBean
    private BlogPostMapper blogPostMapper;

    private BlogPostDTO blogPostDTO;
    private BlogPost blogPost;
    private UUID testId;
    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        testUserDTO = UserDTO.builder()
                .id(testUser.getId())
                .username("testuser")
                .build();

        blogPost = new BlogPost();
        blogPost.setId(testId);
        blogPost.setTitle("Test Post");
        blogPost.setContent("Test content");
        blogPost.setAuthor(testUser);
        blogPost.setPostDate(LocalDateTime.now());
        blogPost.setSlug("test-post");

        blogPostDTO = BlogPostDTO.builder()
                .id(testId)
                .title("Test Post")
                .content("Test content")
                .author(testUserDTO)
                .slug("test-post")
                .status("DRAFT")
                .postDate(LocalDateTime.now())
                .tags(new HashSet<>())
                .build();
    }

    @Test
    void getAllPosts_ShouldReturnPageOfPosts() throws Exception {
        // Arrange
        PageRequest expectedPageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "postDate"));
        Page<BlogPost> postPage = new PageImpl<>(Arrays.asList(blogPost));

        ArgumentCaptor<PageRequest> pageRequestCaptor = ArgumentCaptor.forClass(PageRequest.class);
        when(blogPostService.getAllPosts(any(PageRequest.class))).thenReturn(postPage);
        when(blogPostMapper.toDTO(blogPost)).thenReturn(blogPostDTO);

        // Act & Assert
        mockMvc.perform(get("/api/posts")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "postDate")
                .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(testId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Test Post"))
                .andExpect(jsonPath("$.content[0].slug").value("test-post"));

        verify(blogPostService).getAllPosts(pageRequestCaptor.capture());
        verify(blogPostMapper).toDTO(blogPost);

        PageRequest capturedPageRequest = pageRequestCaptor.getValue();
        assertEquals(expectedPageRequest.getPageNumber(), capturedPageRequest.getPageNumber());
        assertEquals(expectedPageRequest.getPageSize(), capturedPageRequest.getPageSize());
        assertEquals(expectedPageRequest.getSort(), capturedPageRequest.getSort());
    }

    @Test
    void getAllPosts_WithInvalidSortDirection_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/posts")
                .param("direction", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllPosts_WithNegativePage_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/posts")
                .param("page", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllPosts_WithNegativeSize_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/posts")
                .param("size", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPostById_WithExistingId_ShouldReturnPost() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.of(blogPost));
        when(blogPostMapper.toDTO(blogPost)).thenReturn(blogPostDTO);

        // Act & Assert
        mockMvc.perform(get("/api/posts/{id}", testId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testId.toString()))
                .andExpect(jsonPath("$.title").value("Test Post"));
    }

    @Test
    void getPostById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/posts/{id}", testId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createPost_WithValidData_ShouldReturnCreatedPost() throws Exception {
        // Arrange
        when(blogPostMapper.toEntity(any(BlogPostDTO.class))).thenReturn(blogPost);
        when(blogPostService.createPost(any(BlogPost.class))).thenReturn(blogPost);
        when(blogPostMapper.toDTO(blogPost)).thenReturn(blogPostDTO);

        // Act & Assert
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blogPostDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Post"))
                .andExpect(jsonPath("$.content").value("Test content"));

        verify(blogPostMapper).toEntity(any(BlogPostDTO.class));
        verify(blogPostService).createPost(any(BlogPost.class));
        verify(blogPostMapper).toDTO(blogPost);
    }

    @Test
    void createPost_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Arrange
        BlogPostDTO invalidPost = BlogPostDTO.builder()
                .title("") // Invalid: empty title
                .content("Test content")
                .author(testUserDTO)
                .status("DRAFT")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPost)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updatePost_WithExistingId_ShouldReturnUpdatedPost() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.of(blogPost));
        when(blogPostMapper.toEntity(any(BlogPostDTO.class))).thenReturn(blogPost);
        when(blogPostService.updatePost(any(BlogPost.class))).thenReturn(blogPost);
        when(blogPostMapper.toDTO(blogPost)).thenReturn(blogPostDTO);

        // Act & Assert
        mockMvc.perform(put("/api/posts/{id}", testId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blogPostDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testId.toString()))
                .andExpect(jsonPath("$.title").value("Test Post"));
    }

    @Test
    void updatePost_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/posts/{id}", testId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blogPostDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletePost_WithExistingId_ShouldReturnNoContent() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.of(blogPost));

        // Act & Assert
        mockMvc.perform(delete("/api/posts/{id}", testId))
                .andExpect(status().isNoContent());

        verify(blogPostService).deletePost(testId);
    }

    @Test
    void deletePost_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(blogPostService.getPostById(testId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(delete("/api/posts/{id}", testId))
                .andExpect(status().isNotFound());

        verify(blogPostService, never()).deletePost(any());
    }
}