package com.example.blogapp.service;

import com.example.blogapp.dto.auth.AuthResponse;
import com.example.blogapp.dto.auth.LoginRequest;
import com.example.blogapp.dto.auth.RegisterRequest;
import com.example.blogapp.dto.UserDTO;
import com.example.blogapp.entity.User;
import com.example.blogapp.mapper.UserMapper;
import com.example.blogapp.security.JwtService;
import com.example.blogapp.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private UserDTO testUserDTO;
    private static final String TEST_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        // Setup register request
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");

        // Setup login request
        loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("password123");

        // Setup test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setFullName("Test User");

        // Setup test user DTO
        testUserDTO = UserDTO.builder()
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .build();
    }

    @Test
    void register_WithValidRequest_ShouldCreateUserAndReturnToken() {
        // Arrange
        when(userService.existsByEmail(anyString())).thenReturn(false);
        when(userService.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userService.createUser(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn(TEST_TOKEN);
        when(userMapper.toDTO(any(User.class))).thenReturn(testUserDTO);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals(TEST_TOKEN, response.getToken());
        assertEquals(testUserDTO, response.getUser());

        verify(userService).createUser(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertEquals(registerRequest.getUsername(), capturedUser.getUsername());
        assertEquals(registerRequest.getEmail(), capturedUser.getEmail());
        assertEquals("hashedPassword", capturedUser.getPasswordHash());
    }

    @Test
    void register_WithExistingUsername_ShouldThrowException() {
        // Arrange
        when(userService.existsByUsername(registerRequest.getUsername())).thenReturn(true);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });

        verify(userService, never()).createUser(any());
    }

    @Test
    void register_WithExistingEmail_ShouldThrowException() {
        // Arrange
        when(userService.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });

        verify(userService, never()).createUser(any());
    }

    @Test
    void login_WithValidUsername_ShouldReturnToken() {
        // Arrange
        when(userService.getUserByUsername(loginRequest.getUsernameOrEmail()))
                .thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn(TEST_TOKEN);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(TEST_TOKEN, response.getToken());
        assertEquals(testUserDTO, response.getUser());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_WithValidEmail_ShouldReturnToken() {
        // Arrange
        loginRequest.setUsernameOrEmail("test@example.com");
        when(userService.getUserByUsername(loginRequest.getUsernameOrEmail()))
                .thenReturn(Optional.empty());
        when(userService.getUserByEmail(loginRequest.getUsernameOrEmail()))
                .thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn(TEST_TOKEN);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(TEST_TOKEN, response.getToken());
        assertEquals(testUserDTO, response.getUser());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_WithInvalidCredentials_ShouldThrowException() {
        // Arrange
        when(userService.getUserByUsername(loginRequest.getUsernameOrEmail()))
                .thenReturn(Optional.empty());
        when(userService.getUserByEmail(loginRequest.getUsernameOrEmail()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void logout_ShouldBlacklistToken() {
        // Arrange
        String token = "Bearer " + TEST_TOKEN;

        // Act
        authService.logout(token);

        // Assert
        verify(jwtService).blacklistToken(token);
    }
}