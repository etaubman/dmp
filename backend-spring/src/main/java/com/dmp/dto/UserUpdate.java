package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Match FastAPI UserUpdate: all optional for PATCH. */
public class UserUpdate {

    private String email;
    private String name;
    private String role;

    private boolean emailIncluded;
    private boolean nameIncluded;
    private boolean roleIncluded;

    public String getEmail() { return email; }
    @JsonProperty("email")
    public void setEmail(String email) {
        this.email = email;
        this.emailIncluded = true;
    }
    public boolean hasEmailUpdate() { return emailIncluded; }

    public String getName() { return name; }
    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
        this.nameIncluded = true;
    }
    public boolean hasNameUpdate() { return nameIncluded; }

    public String getRole() { return role; }
    @JsonProperty("role")
    public void setRole(String role) {
        this.role = role;
        this.roleIncluded = true;
    }
    public boolean hasRoleUpdate() { return roleIncluded; }
}
