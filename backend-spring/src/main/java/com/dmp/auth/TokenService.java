package com.dmp.auth;

import com.dmp.config.AuthProperties;
import com.dmp.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class TokenService {

    private final AuthProperties authProperties;

    public TokenService(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    public String createToken(User user) {
        long expireMs = authProperties.getJwtExpireMinutes() * 60L * 1000;
        Date expiry = new Date(System.currentTimeMillis() + expireMs);
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .expiration(expiry)
                .signWith(getSecretKey())
                .compact();
    }

    public Integer getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Integer.parseInt(claims.getSubject());
        } catch (Exception e) {
            return null;
        }
    }

    private SecretKey getSecretKey() {
        String secret = authProperties.getJwtSecret();
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // HS256 requires >= 256 bits (32 bytes)
        if (keyBytes.length < 32) {
            keyBytes = java.util.Arrays.copyOf(keyBytes, 32);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
