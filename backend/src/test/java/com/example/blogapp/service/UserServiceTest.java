package com.example.blogapp.service;

import com.example.blogapp.entity.User;
import com.example.blogapp.exception.InvalidPasswordException;
import com.example.blogapp.repository.UserRepository;
import com.example.blogapp.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User testUser;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(testId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setFullName("Test User");
    }

    @Test
    void createUser_WithValidUser_ShouldSaveAndReturnUser() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.createUser(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.getId());
        assertEquals(testUser.getUsername(), result.getUsername());
        assertEquals(testUser.getEmail(), result.getEmail());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUser_WithValidUser_ShouldSaveAndReturnUpdatedUser() {
        // Arrange
        String updatedName = "Updated User Name";
        testUser.setFullName(updatedName);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.updateUser(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(updatedName, result.getFullName());
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteUser_WithValidId_ShouldDeleteUser() {
        // Act
        userService.deleteUser(testId);

        // Assert
        verify(userRepository).deleteById(testId);
    }

    @Test
    void getUserById_WithExistingId_ShouldReturnUser() {
        // Arrange
        when(userRepository.findById(testId)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserById(testId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testId, result.get().getId());
        assertEquals(testUser.getUsername(), result.get().getUsername());
    }

    @Test
    void getUserById_WithNonExistingId_ShouldReturnEmpty() {
        // Arrange
        when(userRepository.findById(testId)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserById(testId);

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void getUserByEmail_WithExistingEmail_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserByEmail(testUser.getEmail());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
    }

    @Test
    void getUserByUsername_WithExistingUsername_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getUserByUsername(testUser.getUsername());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getUsername(), result.get().getUsername());
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // Arrange
        List<User> expectedUsers = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(expectedUsers);

        // Act
        List<User> result = userService.getAllUsers();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testUser.getId(), result.get(0).getId());
    }

    @Test
    void existsByEmail_WithExistingEmail_ShouldReturnTrue() {
        // Arrange
        when(userRepository.existsByEmail(testUser.getEmail())).thenReturn(true);

        // Act
        boolean result = userService.existsByEmail(testUser.getEmail());

        // Assert
        assertTrue(result);
    }

    @Test
    void existsByEmail_WithNonExistingEmail_ShouldReturnFalse() {
        // Arrange
        when(userRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

        // Act
        boolean result = userService.existsByEmail("nonexistent@example.com");

        // Assert
        assertFalse(result);
    }

    @Test
    void existsByUsername_WithExistingUsername_ShouldReturnTrue() {
        // Arrange
        when(userRepository.existsByUsername(testUser.getUsername())).thenReturn(true);

        // Act
        boolean result = userService.existsByUsername(testUser.getUsername());

        // Assert
        assertTrue(result);
    }

    @Test
    void existsByUsername_WithNonExistingUsername_ShouldReturnFalse() {
        // Arrange
        when(userRepository.existsByUsername("nonexistent")).thenReturn(false);

        // Act
        boolean result = userService.existsByUsername("nonexistent");

        // Assert
        assertFalse(result);
    }

    @Test
    void updatePassword_WithValidPassword_ShouldUpdateAndSave() {
        // Arrange
        String newPassword = "newPassword123";
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        userService.updatePassword(testUser, newPassword);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("newHashedPassword", savedUser.getPasswordHash());
    }

    @Test
    void updatePassword_WithInvalidPassword_ShouldThrowException() {
        // Arrange
        String newPassword = "newPassword123";
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThrows(InvalidPasswordException.class, () -> {
            userService.updatePassword(testUser, newPassword);
        });

        verify(userRepository, never()).save(any(User.class));
    }
}