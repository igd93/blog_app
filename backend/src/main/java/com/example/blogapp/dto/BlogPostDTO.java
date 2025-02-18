package com.example.blogapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class BlogPostDTO {
    private UUID id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    private String slug;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Status is required")
    private String status;

    private LocalDateTime postDate;

    private String readTime;

    private Set<TagDTO> tags;

    @NotNull(message = "Author is required")
    private UserDTO author;
}
