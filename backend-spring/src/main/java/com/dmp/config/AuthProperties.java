package com.dmp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    private String jwtSecret = "dev-secret-change-in-production";
    private String jwtAlgorithm = "HS256";
    private int jwtExpireMinutes = 60;
    private boolean devAlwaysLoggedIn = false;
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
