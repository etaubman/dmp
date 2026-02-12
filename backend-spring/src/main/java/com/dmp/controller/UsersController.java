package com.dmp.controller;

import com.dmp.dto.UserCreate;
import com.dmp.dto.UserOut;
import com.dmp.dto.UserUpdate;
import com.dmp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** User CRUD. */
@RestController
@RequestMapping("/api/users")
@Tag(name = "users", description = "User management")
public class UsersController {

    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List users", description = "All users ordered by email")
    public ResponseEntity<List<UserOut>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user", description = "Returns a single user by id")
    public UserOut getUser(@PathVariable int userId) {
        return userService.getUser(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create user", description = "Creates a new user; email must be unique")
    public UserOut createUser(@Valid @RequestBody UserCreate body) {
        return userService.createUser(body);
    }

    @PatchMapping("/{userId}")
    @Operation(summary = "Update user", description = "Partial update; only provided fields are changed")
    public UserOut updateUser(@PathVariable int userId, @RequestBody UserUpdate body) {
        return userService.updateUser(userId, body);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete user", description = "Permanently deletes the user")
    public void deleteUser(@PathVariable int userId) {
        userService.deleteUser(userId);
    }
}
