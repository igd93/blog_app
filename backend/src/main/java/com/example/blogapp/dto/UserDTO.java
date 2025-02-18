package com.example.blogapp.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String avatarUrl;

}
