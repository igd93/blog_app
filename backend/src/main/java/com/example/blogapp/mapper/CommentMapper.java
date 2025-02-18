package com.example.blogapp.mapper;

import com.example.blogapp.dto.CommentDTO;
import com.example.blogapp.entity.Comment;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final ModelMapper mapper;

    public CommentDTO toDTO(Comment comment) {
        return mapper.map(comment, CommentDTO.class);
    }

    public Comment toEntity(CommentDTO dto) {
        return mapper.map(dto, Comment.class);
    }
}