package com.example.blogapp.controller;

import com.example.blogapp.dto.PasswordUpdateRequest;
import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.UserMapper;
import com.example.blogapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userMapper.toDTO(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDTO userDTO) {

        // Ensure we're updating the authenticated user
        user.setFullName(userDTO.getFullName());
        user.setBio(userDTO.getBio());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(userMapper.toDTO(updatedUser));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PasswordUpdateRequest request) {
        // TODO: Implement password update logic
        return ResponseEntity.ok().build();
    }
}