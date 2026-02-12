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

/**
 * JWT creation and parsing. Tokens carry subject (user id) and email claim; expiry from {@link AuthProperties}.
 */
@Service
public class TokenService {

    private static final int MIN_KEY_BYTES_HS256 = 32;

    private final AuthProperties authProperties;

    public TokenService(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    /** Builds a signed JWT for the given user with configured expiry. */
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

    /** Parses the token and returns the subject (user id), or null if invalid/expired. */
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

    /** HS256 requires at least 256 bits (32 bytes); pad if shorter. */
    private SecretKey getSecretKey() {
        String secret = authProperties.getJwtSecret();
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_KEY_BYTES_HS256) {
            keyBytes = java.util.Arrays.copyOf(keyBytes, MIN_KEY_BYTES_HS256);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
