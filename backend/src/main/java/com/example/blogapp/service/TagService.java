package com.example.blogapp.service;

import com.example.blogapp.entity.Tag;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagService {
    Tag createTag(Tag tag);

    Tag updateTag(Tag tag);

    void deleteTag(UUID id);

    Optional<Tag> getTagById(UUID id);

    Optional<Tag> getTagBySlug(String slug);

    Optional<Tag> getTagByName(String name);

    List<Tag> getAllTags();

    boolean existsByName(String name);

    String generateSlug(String name);
}