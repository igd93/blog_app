package com.example.blogapp.service;

import com.example.blogapp.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    User createUser(User user);

    User updateUser(User user);

    void deleteUser(UUID id);

    Optional<User> getUserById(UUID id);

    Optional<User> getUserByEmail(String email);

    Optional<User> getUserByUsername(String username);

    List<User> getAllUsers();

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    public void updatePassword(User user, String newPassword);
}