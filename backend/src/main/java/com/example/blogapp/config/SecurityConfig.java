package com.example.blogapp.config;

import com.example.blogapp.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    /**
     * Configures the security filter chain for the application.
     * This bean defines the core security configuration including:
     * 
     * - CSRF protection is disabled since we're using stateless JWT authentication
     * - URL-based security rules:
     * - /api/auth/** endpoints are publicly accessible (for login/register)
     * - /health endpoint is publicly accessible
     * - Public read-only blog endpoints
     * - All other endpoints require authentication
     * - Session management is set to STATELESS since we're using JWT tokens
     * - Configures the authentication provider that handles username/password
     * validation
     * - Adds the JWT authentication filter before the default authentication filter
     * to process JWT tokens before attempting username/password authentication
     */
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    // Public endpoints
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers("/health").permitAll();
                    // Public read-only blog endpoints
                    auth.requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/tags/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/comments/test-auth").permitAll();
                    // Comment operations - require authentication but explicitly allowed
                    auth.requestMatchers(HttpMethod.POST, "/api/posts/*/comments").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/api/comments/**").authenticated();
                    auth.requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated();
                    // All other endpoints require authentication
                    auth.anyRequest().authenticated();
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://frontend:5173",
                "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}