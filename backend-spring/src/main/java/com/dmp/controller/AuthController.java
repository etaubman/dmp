package com.dmp.controller;

import com.dmp.auth.AuthService;
import com.dmp.auth.TokenService;
import com.dmp.dto.AuthUserOut;
import com.dmp.dto.LoginRequest;
import com.dmp.dto.TokenResponse;
import com.dmp.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "auth", description = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    public AuthController(AuthService authService, TokenService tokenService) {
        this.authService = authService;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate with email and password; returns JWT")
    public TokenResponse login(@Valid @RequestBody LoginRequest body) {
        Optional<User> userOpt = authService.verifyCredentials(body.getEmail(), body.getPassword());
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        String token = tokenService.createToken(userOpt.get());
        return new TokenResponse(token);
    }

    @GetMapping("/me")
    @Operation(summary = "Current user", description = "Returns the currently authenticated user")
    public AuthUserOut me(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return AuthUserOut.from(user);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Client should discard the token. JWT is stateless.")
    public Map<String, String> logout() {
        return Map.of("message", "Logged out");
    }
}
