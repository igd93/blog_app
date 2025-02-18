package com.example.blogapp.mapper;

import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.User;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {
    private final ModelMapper mapper;

    public UserDTO toDTO(User user) {
        return mapper.map(user, UserDTO.class);
    }

    public User toEntity(UserDTO dto) {
        return mapper.map(dto, User.class);
    }
}