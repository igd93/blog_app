package com.example.blogapp.security;

import com.example.blogapp.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration,"
                +
                "org.springframework.boot.autoconfigure.security.reactive.ReactiveOAuth2ClientAutoConfiguration," +
                "org.springframework.boot.autoconfigure.security.reactive.ReactiveOAuth2ResourceServerAutoConfiguration"
})
@TestPropertySource(locations = "classpath:application-test.properties")
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private User testUser;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", jwtExpiration);

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
    }

    @Test
    void generateToken_WithValidUser_ShouldGenerateValidToken() {
        // Act
        String token = jwtService.generateToken(testUser);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
        assertEquals(testUser.getUsername(), jwtService.extractUsername(token));
    }

    @Test
    void extractUsername_WithValidToken_ShouldReturnUsername() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        String username = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUser.getUsername(), username);
    }

    @Test
    void isTokenValid_WithValidTokenAndUser_ShouldReturnTrue() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        boolean isValid = jwtService.isTokenValid(token, testUser);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_WithInvalidUsername_ShouldReturnFalse() {
        // Arrange
        String token = jwtService.generateToken(testUser);
        User differentUser = new User();
        differentUser.setUsername("differentuser");

        // Act
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_WithBlacklistedToken_ShouldReturnFalse() {
        // Arrange
        String token = jwtService.generateToken(testUser);
        jwtService.blacklistToken(token);

        // Act
        boolean isValid = jwtService.isTokenValid(token, testUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void blacklistToken_WithValidToken_ShouldBlacklistToken() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        jwtService.blacklistToken(token);

        // Assert
        assertTrue(jwtService.isTokenBlacklisted(token));
    }

    @Test
    void blacklistToken_WithBearerToken_ShouldRemoveBearerPrefix() {
        // Arrange
        String token = jwtService.generateToken(testUser);
        String bearerToken = "Bearer " + token;

        // Act
        jwtService.blacklistToken(bearerToken);

        // Assert
        assertTrue(jwtService.isTokenBlacklisted(token));
        assertFalse(jwtService.isTokenBlacklisted(bearerToken));
    }

    @Test
    void isTokenBlacklisted_WithNonBlacklistedToken_ShouldReturnFalse() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        boolean isBlacklisted = jwtService.isTokenBlacklisted(token);

        // Assert
        assertFalse(isBlacklisted);
    }

    @Test
    void isTokenValid_WithExpiredToken_ShouldReturnFalse() {
        // Arrange
        // Set expiration to 1 second ago
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        String token = jwtService.generateToken(testUser);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", jwtExpiration);

        // Act & Assert
        assertThrows(ExpiredJwtException.class, () -> {
            jwtService.isTokenValid(token, testUser);
        });
    }
}