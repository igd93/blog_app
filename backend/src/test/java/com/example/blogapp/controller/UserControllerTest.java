package com.example.blogapp.controller;

import com.example.blogapp.config.TestSecurityConfig;
import com.example.blogapp.dto.PasswordUpdateRequest;
import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.UserMapper;
import com.example.blogapp.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private UserService userService;

        @MockBean
        private UserMapper userMapper;

        private User testUser;
        private UserDTO userDTO;
        private UUID testId;

        @BeforeEach
        void setUp() {
                testId = UUID.randomUUID();

                testUser = new User();
                testUser.setId(testId);
                testUser.setUsername("testuser");
                testUser.setEmail("test@example.com");
                testUser.setFullName("Test User");
                testUser.setBio("Test bio");
                testUser.setAvatarUrl("https://example.com/avatar.jpg");

                userDTO = UserDTO.builder()
                                .id(testId)
                                .username("testuser")
                                .email("test@example.com")
                                .fullName("Test User")
                                .bio("Test bio")
                                .avatarUrl("https://example.com/avatar.jpg")
                                .build();

                // Set up authentication
                Authentication auth = new UsernamePasswordAuthenticationToken(testUser, null);
                SecurityContextHolder.getContext().setAuthentication(auth);
        }

        @Test
        void getProfile_ShouldReturnUserProfile() throws Exception {
                // Arrange
                when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

                // Act & Assert
                mockMvc.perform(get("/api/users/profile")
                                .with(req -> {
                                        req.setUserPrincipal(new UsernamePasswordAuthenticationToken(testUser, null));
                                        return req;
                                }))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.username").value("testuser"))
                                .andExpect(jsonPath("$.email").value("test@example.com"))
                                .andExpect(jsonPath("$.fullName").value("Test User"));

                verify(userMapper).toDTO(any(User.class));
        }

        @Test
        void updateProfile_WithValidData_ShouldReturnUpdatedProfile() throws Exception {
                // Arrange
                UserDTO updateDTO = UserDTO.builder()
                                .id(testId)
                                .username("testuser")
                                .email("test@example.com")
                                .fullName("Updated Name")
                                .bio("Updated bio")
                                .avatarUrl("https://example.com/new-avatar.jpg")
                                .build();

                User updatedUser = new User();
                updatedUser.setId(testId);
                updatedUser.setUsername("testuser");
                updatedUser.setEmail("test@example.com");
                updatedUser.setFullName("Updated Name");
                updatedUser.setBio("Updated bio");
                updatedUser.setAvatarUrl("https://example.com/new-avatar.jpg");

                when(userService.updateUser(any(User.class))).thenReturn(updatedUser);
                when(userMapper.toDTO(any(User.class))).thenReturn(updateDTO);

                // Act & Assert
                mockMvc.perform(put("/api/users/profile")
                                .with(req -> {
                                        req.setUserPrincipal(new UsernamePasswordAuthenticationToken(testUser, null));
                                        return req;
                                })
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDTO)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.fullName").value("Updated Name"));

                verify(userService).updateUser(any(User.class));
                verify(userMapper).toDTO(any(User.class));
        }

        @Test
        void updateProfile_WithInvalidData_ShouldReturnBadRequest() throws Exception {
                // Arrange
                UserDTO invalidDTO = UserDTO.builder()
                                .fullName("") // Invalid: empty full name
                                .build();

                // Act & Assert
                mockMvc.perform(put("/api/users/profile")
                                .with(req -> {
                                        req.setUserPrincipal(new UsernamePasswordAuthenticationToken(testUser, null));
                                        return req;
                                })
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidDTO)))
                                .andExpect(status().isBadRequest());

                verify(userService, never()).updateUser(any());
        }

        @Test
        void updatePassword_WithValidData_ShouldReturnOk() throws Exception {
                // Arrange
                PasswordUpdateRequest passwordRequest = new PasswordUpdateRequest();
                passwordRequest.setCurrentPassword("oldPassword");
                passwordRequest.setNewPassword("newPassword123");
                passwordRequest.setConfirmPassword("newPassword123");

                doNothing().when(userService).updatePassword(any(User.class), anyString());

                // Act & Assert
                mockMvc.perform(put("/api/users/password")
                                .with(req -> {
                                        req.setUserPrincipal(new UsernamePasswordAuthenticationToken(testUser, null));
                                        return req;
                                })
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(passwordRequest)))
                                .andExpect(status().isOk());

                verify(userService).updatePassword(any(User.class), eq(passwordRequest.getCurrentPassword()));
        }

        @Test
        void updatePassword_WithInvalidData_ShouldReturnBadRequest() throws Exception {
                // Arrange
                PasswordUpdateRequest passwordRequest = new PasswordUpdateRequest();
                passwordRequest.setCurrentPassword("");
                passwordRequest.setNewPassword("");
                passwordRequest.setConfirmPassword("");

                // Act & Assert
                mockMvc.perform(put("/api/users/password")
                                .with(req -> {
                                        req.setUserPrincipal(new UsernamePasswordAuthenticationToken(testUser, null));
                                        return req;
                                })
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(passwordRequest)))
                                .andExpect(status().isBadRequest());

                verify(userService, never()).updatePassword(any(), anyString());
        }
}