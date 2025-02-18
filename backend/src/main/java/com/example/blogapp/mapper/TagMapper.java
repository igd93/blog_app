package com.example.blogapp.mapper;

import com.example.blogapp.dto.TagDTO;
import com.example.blogapp.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TagMapper {
    private final ModelMapper mapper;

    public TagDTO toDTO(Tag tag) {
        return mapper.map(tag, TagDTO.class);
    }

    public Tag toEntity(TagDTO dto) {
        return mapper.map(dto, Tag.class);
    }
}