package com.example.blogapp.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentDTO {
    private UUID id;
    private String content;
    private UserDTO author;
    private UUID postId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
