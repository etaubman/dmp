package com.dmp.dto;

import com.dmp.model.User;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthUserOut {

    private Integer id;
    private String email;
    private String name;
    private String role;

    public AuthUserOut() {}
    public AuthUserOut(Integer id, String email, String name, String role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public static AuthUserOut from(User user) {
        return new AuthUserOut(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
