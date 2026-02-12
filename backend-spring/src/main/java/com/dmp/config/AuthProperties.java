package com.dmp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for JWT and auth behaviour. Bound to {@code app.auth.*}.
 */
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    /** Secret used to sign/verify JWTs; must be at least 32 bytes for HS256. */
    private String jwtSecret = "dev-secret-change-in-production";
    private String jwtAlgorithm = "HS256";
    /** Token validity in minutes. */
    private int jwtExpireMinutes = 60;
    /** If true, all requests are treated as authenticated as devUserEmail (dev only). */
    private boolean devAlwaysLoggedIn = false;
    /** Email used when devAlwaysLoggedIn is true; fallback to first admin if user missing. */
    private String devUserEmail = "ethan.taubman@example.com";

    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }
    public String getJwtAlgorithm() { return jwtAlgorithm; }
    public void setJwtAlgorithm(String jwtAlgorithm) { this.jwtAlgorithm = jwtAlgorithm; }
    public int getJwtExpireMinutes() { return jwtExpireMinutes; }
    public void setJwtExpireMinutes(int jwtExpireMinutes) { this.jwtExpireMinutes = jwtExpireMinutes; }
    public boolean isDevAlwaysLoggedIn() { return devAlwaysLoggedIn; }
    public void setDevAlwaysLoggedIn(boolean devAlwaysLoggedIn) { this.devAlwaysLoggedIn = devAlwaysLoggedIn; }
    public String getDevUserEmail() { return devUserEmail; }
    public void setDevUserEmail(String devUserEmail) { this.devUserEmail = devUserEmail; }
}
