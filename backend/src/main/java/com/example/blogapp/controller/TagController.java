package com.example.blogapp.controller;

import com.example.blogapp.dto.TagDTO;
import com.example.blogapp.entity.Tag;
import com.example.blogapp.mapper.TagMapper;
import com.example.blogapp.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;
    private final TagMapper tagMapper;

    @GetMapping
    public ResponseEntity<Page<TagDTO>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<TagDTO> tags = tagService.getAllTags(pageRequest)
                .map(tagMapper::toDTO);

        return ResponseEntity.ok(tags);
    }

    @PostMapping
    public ResponseEntity<TagDTO> createTag(@Valid @RequestBody TagDTO tagDTO) {
        if (tagService.existsByName(tagDTO.getName())) {
            return ResponseEntity.badRequest().build();
        }

        Tag tag = tagMapper.toEntity(tagDTO);
        Tag savedTag = tagService.createTag(tag);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tagMapper.toDTO(savedTag));
    }
}