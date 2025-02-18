package com.example.blogapp.dto;

import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TagDTO {
    private UUID id;
    private String name;
    private String slug;
    private Set<BlogPostDTO> posts;
}
