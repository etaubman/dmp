package com.dmp.auth;

import com.dmp.config.AuthProperties;
import com.dmp.model.User;
import com.dmp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Handles credential verification, JWT-to-user resolution, and dev bypass.
 * Does not perform login itself; used by {@link com.dmp.controller.AuthController} and {@link JwtAuthenticationFilter}.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuthProperties authProperties;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       TokenService tokenService, AuthProperties authProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.authProperties = authProperties;
    }

    /**
     * Verifies email/password against stored user; returns empty if invalid or no password set.
     */
    public Optional<User> verifyCredentials(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return Optional.empty();
        }
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.strip().toLowerCase());
        if (userOpt.isEmpty() || userOpt.get().getPasswordHash() == null) {
            return Optional.empty();
        }
        if (!passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return Optional.empty();
        }
        return userOpt;
    }

    /** Resolves a JWT to the corresponding user; empty if token invalid or user missing. */
    public Optional<User> getUserFromToken(String token) {
        Integer userId = tokenService.getUserIdFromToken(token);
        if (userId == null) {
            return Optional.empty();
        }
        return userRepository.findById(userId);
    }

    /** When app.auth.dev-always-logged-in is true, returns the dev user (or first admin). Otherwise empty. */
    public Optional<User> getDevUser() {
        if (!authProperties.isDevAlwaysLoggedIn()) {
            return Optional.empty();
        }
        Optional<User> byEmail = userRepository.findByEmailIgnoreCase(authProperties.getDevUserEmail());
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return userRepository.findFirstByRoleOrderByEmailAsc("admin");
    }
}
