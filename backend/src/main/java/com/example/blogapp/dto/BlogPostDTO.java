package com.example.blogapp.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BlogPostDTO {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String content;
    private String status;
    private LocalDateTime postDate;
    private String readTime;
    private Set<TagDTO> tags;
    private UserDTO author;

}
