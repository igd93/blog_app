package com.example.blogapp.service.impl;

import com.example.blogapp.dto.auth.AuthResponse;
import com.example.blogapp.dto.auth.LoginRequest;
import com.example.blogapp.dto.auth.RegisterRequest;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.UserMapper;
import com.example.blogapp.service.AuthService;
import com.example.blogapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail()) ||
                userService.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username or email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        User savedUser = userService.createUser(user);
        String token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toDTO(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()));

        User user = userService.getUserByUsername(request.getUsernameOrEmail())
                .orElseGet(() -> userService.getUserByEmail(request.getUsernameOrEmail())
                        .orElseThrow(() -> new IllegalArgumentException("User not found")));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toDTO(user))
                .build();
    }

    @Override
    public void logout(String token) {
        // Implement token blacklisting or invalidation if needed
        // This depends on your token management strategy
    }
}