package com.example.blogapp.dto.auth;

import com.example.blogapp.dto.UserDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UserDTO user;
}