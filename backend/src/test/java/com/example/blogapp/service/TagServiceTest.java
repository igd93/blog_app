package com.example.blogapp.service;

import com.example.blogapp.entity.Tag;
import com.example.blogapp.repository.TagRepository;
import com.example.blogapp.service.impl.TagServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagServiceImpl tagService;

    private Tag testTag;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testTag = new Tag();
        testTag.setId(testId);
        testTag.setName("Test Tag");
        testTag.setSlug("test-tag");
    }

    @Test
    void createTag_WithValidTag_ShouldSaveAndReturnTag() {
        // Arrange
        when(tagRepository.save(any(Tag.class))).thenReturn(testTag);

        // Act
        Tag result = tagService.createTag(testTag);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.getId());
        assertEquals(testTag.getName(), result.getName());
        assertEquals(testTag.getSlug(), result.getSlug());
        verify(tagRepository).save(testTag);
    }

    @Test
    void createTag_WithoutSlug_ShouldGenerateSlugAndSave() {
        // Arrange
        Tag tagWithoutSlug = new Tag();
        tagWithoutSlug.setName("Test Tag");

        Tag expectedTag = new Tag();
        expectedTag.setName("Test Tag");
        expectedTag.setSlug("test-tag");

        when(tagRepository.save(any(Tag.class))).thenReturn(expectedTag);

        // Act
        Tag result = tagService.createTag(tagWithoutSlug);

        // Assert
        assertNotNull(result);
        assertEquals("test-tag", result.getSlug());
        verify(tagRepository).save(any(Tag.class));
    }

    @Test
    void updateTag_WithValidTag_ShouldSaveAndReturnUpdatedTag() {
        // Arrange
        String updatedName = "Updated Tag Name";
        testTag.setName(updatedName);
        when(tagRepository.save(any(Tag.class))).thenReturn(testTag);

        // Act
        Tag result = tagService.updateTag(testTag);

        // Assert
        assertNotNull(result);
        assertEquals(updatedName, result.getName());
        verify(tagRepository).save(testTag);
    }

    @Test
    void deleteTag_WithValidId_ShouldDeleteTag() {
        // Act
        tagService.deleteTag(testId);

        // Assert
        verify(tagRepository).deleteById(testId);
    }

    @Test
    void getTagById_WithExistingId_ShouldReturnTag() {
        // Arrange
        when(tagRepository.findById(testId)).thenReturn(Optional.of(testTag));

        // Act
        Optional<Tag> result = tagService.getTagById(testId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testId, result.get().getId());
        assertEquals(testTag.getName(), result.get().getName());
    }

    @Test
    void getTagById_WithNonExistingId_ShouldReturnEmpty() {
        // Arrange
        when(tagRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        Optional<Tag> result = tagService.getTagById(testId);

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void getTagBySlug_WithExistingSlug_ShouldReturnTag() {
        // Arrange
        when(tagRepository.findBySlug("test-tag")).thenReturn(Optional.of(testTag));

        // Act
        Optional<Tag> result = tagService.getTagBySlug("test-tag");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("test-tag", result.get().getSlug());
    }

    @Test
    void getTagByName_WithExistingName_ShouldReturnTag() {
        // Arrange
        when(tagRepository.findByName("Test Tag")).thenReturn(Optional.of(testTag));

        // Act
        Optional<Tag> result = tagService.getTagByName("Test Tag");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Test Tag", result.get().getName());
    }

    @Test
    void getAllTags_ShouldReturnAllTags() {
        // Arrange
        List<Tag> expectedTags = Arrays.asList(testTag);
        when(tagRepository.findAll()).thenReturn(expectedTags);

        // Act
        List<Tag> result = tagService.getAllTags();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTag.getId(), result.get(0).getId());
    }

    @Test
    void getAllTags_WithPagination_ShouldReturnPageOfTags() {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 10);
        List<Tag> tags = Arrays.asList(testTag);
        Page<Tag> tagPage = new PageImpl<>(tags, pageRequest, tags.size());
        when(tagRepository.findAll(pageRequest)).thenReturn(tagPage);

        // Act
        Page<Tag> result = tagService.getAllTags(pageRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testTag.getId(), result.getContent().get(0).getId());
    }

    @Test
    void existsByName_WithExistingName_ShouldReturnTrue() {
        // Arrange
        when(tagRepository.existsByName("Test Tag")).thenReturn(true);

        // Act
        boolean result = tagService.existsByName("Test Tag");

        // Assert
        assertTrue(result);
    }

    @Test
    void existsByName_WithNonExistingName_ShouldReturnFalse() {
        // Arrange
        when(tagRepository.existsByName("Non Existing Tag")).thenReturn(false);

        // Act
        boolean result = tagService.existsByName("Non Existing Tag");

        // Assert
        assertFalse(result);
    }

    @Test
    void generateSlug_WithSpecialCharacters_ShouldReturnCleanSlug() {
        // Arrange
        String tagName = "Test & Tag! With @#$% Special Characters";

        // Act
        String result = tagService.generateSlug(tagName);

        // Assert
        assertEquals("test-tag-with-special-characters", result);
    }

    @Test
    void generateSlug_WithDiacritics_ShouldReturnNormalizedSlug() {
        // Arrange
        String tagName = "Café & Résumé";

        // Act
        String result = tagService.generateSlug(tagName);

        // Assert
        assertEquals("cafe-resume", result);
    }
}