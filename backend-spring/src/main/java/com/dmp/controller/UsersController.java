package com.dmp.controller;

import com.dmp.dto.UserCreate;
import com.dmp.dto.UserOut;
import com.dmp.dto.UserUpdate;
import com.dmp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserOut>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @GetMapping("/{userId}")
    public UserOut getUser(@PathVariable int userId) {
        return userService.getUser(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserOut createUser(@Valid @RequestBody UserCreate body) {
        return userService.createUser(body);
    }

    @PatchMapping("/{userId}")
    public UserOut updateUser(@PathVariable int userId, @RequestBody UserUpdate body) {
        return userService.updateUser(userId, body);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable int userId) {
        userService.deleteUser(userId);
    }
}
