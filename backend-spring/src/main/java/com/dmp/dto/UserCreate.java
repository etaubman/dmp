package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

/** Match FastAPI UserCreate: email required, name/role optional. */
public class UserCreate {

    @NotBlank(message = "Email is required")
    private String email;
    private String name;
    private String role;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.trim().toLowerCase() : null; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
