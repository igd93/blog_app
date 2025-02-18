package com.example.blogapp.mapper;

import com.example.blogapp.dto.BlogPostDTO;
import com.example.blogapp.entity.BlogPost;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BlogPostMapper {
    private final ModelMapper mapper;

    public BlogPostDTO toDTO(BlogPost post) {
        return mapper.map(post, BlogPostDTO.class);
    }

    public BlogPost toEntity(BlogPostDTO dto) {
        return mapper.map(dto, BlogPost.class);
    }
}