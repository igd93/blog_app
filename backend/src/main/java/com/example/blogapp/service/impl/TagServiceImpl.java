package com.example.blogapp.service.impl;

import com.example.blogapp.entity.Tag;
import com.example.blogapp.repository.TagRepository;
import com.example.blogapp.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;

    @Override
    public Tag createTag(Tag tag) {
        if (tag.getSlug() == null || tag.getSlug().isEmpty()) {
            tag.setSlug(generateSlug(tag.getName()));
        }
        return tagRepository.save(tag);
    }

    @Override
    public Tag updateTag(Tag tag) {
        return tagRepository.save(tag);
    }

    @Override
    public void deleteTag(UUID id) {
        tagRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Tag> getTagById(UUID id) {
        return tagRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Tag> getTagBySlug(String slug) {
        return tagRepository.findBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Tag> getTagByName(String name) {
        return tagRepository.findByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return tagRepository.existsByName(name);
    }

    @Override
    public String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    @Override
    public Page<Tag> getAllTags(PageRequest pageRequest) {
        return tagRepository.findAll(pageRequest);
    }
}