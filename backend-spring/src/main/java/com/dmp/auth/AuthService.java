package com.dmp.auth;

import com.dmp.config.AuthProperties;
import com.dmp.model.User;
import com.dmp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

    public Optional<User> getUserFromToken(String token) {
        Integer userId = tokenService.getUserIdFromToken(token);
        if (userId == null) return Optional.empty();
        return userRepository.findById(userId);
    }

    public Optional<User> getDevUser() {
        if (!authProperties.isDevAlwaysLoggedIn()) return Optional.empty();
        Optional<User> byEmail = userRepository.findByEmailIgnoreCase(authProperties.getDevUserEmail());
        if (byEmail.isPresent()) return byEmail;
        return userRepository.findFirstByRoleOrderByEmailAsc("admin");
    }
}
