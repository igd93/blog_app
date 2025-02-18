package com.example.blogapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentDTO {
    private UUID id;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 1000, message = "Content must be between 1 and 1000 characters")
    private String content;

    @NotNull(message = "Author is required")
    private UserDTO author;

    @NotNull(message = "Post ID is required")
    private UUID postId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
