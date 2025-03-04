package com.example.blogapp.controller;

import com.example.blogapp.config.TestSecurityConfig;
import com.example.blogapp.dto.TagDTO;
import com.example.blogapp.entity.Tag;
import com.example.blogapp.mapper.TagMapper;
import com.example.blogapp.service.TagService;
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

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TagController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class TagControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TagService tagService;

    @MockBean
    private TagMapper tagMapper;

    private TagDTO tagDTO;
    private Tag tag;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        tag = new Tag();
        tag.setId(testId);
        tag.setName("test-tag");

        tagDTO = TagDTO.builder()
                .id(testId)
                .name("test-tag")
                .build();
    }

    @Test
    void getAllTags_ShouldReturnPageOfTags() throws Exception {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "name"));
        Page<Tag> tagPage = new PageImpl<>(Arrays.asList(tag));

        when(tagService.getAllTags(any(PageRequest.class))).thenReturn(tagPage);
        when(tagMapper.toDTO(tag)).thenReturn(tagDTO);

        // Act & Assert
        mockMvc.perform(get("/api/tags")
                .param("page", "0")
                .param("size", "20")
                .param("sortBy", "name")
                .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(testId.toString()))
                .andExpect(jsonPath("$.content[0].name").value("test-tag"));

        verify(tagService).getAllTags(any(PageRequest.class));
        verify(tagMapper).toDTO(tag);
    }

    @Test
    void getAllTags_WithInvalidSortDirection_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/tags")
                .param("direction", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTag_WithValidData_ShouldReturnCreatedTag() throws Exception {
        // Arrange
        when(tagService.existsByName(tagDTO.getName())).thenReturn(false);
        when(tagMapper.toEntity(any(TagDTO.class))).thenReturn(tag);
        when(tagService.createTag(any(Tag.class))).thenReturn(tag);
        when(tagMapper.toDTO(tag)).thenReturn(tagDTO);

        // Act & Assert
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("test-tag"));

        verify(tagService).existsByName(tagDTO.getName());
        verify(tagMapper).toEntity(any(TagDTO.class));
        verify(tagService).createTag(any(Tag.class));
        verify(tagMapper).toDTO(tag);
    }

    @Test
    void createTag_WithExistingName_ShouldReturnBadRequest() throws Exception {
        // Arrange
        when(tagService.existsByName(tagDTO.getName())).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagDTO)))
                .andExpect(status().isBadRequest());

        verify(tagService).existsByName(tagDTO.getName());
        verify(tagService, never()).createTag(any());
    }

    @Test
    void createTag_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Arrange
        TagDTO invalidTag = TagDTO.builder()
                .name("") // Invalid: empty name
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTag)))
                .andExpect(status().isBadRequest());

        verify(tagService, never()).createTag(any());
    }
}