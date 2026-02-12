package com.dmp.service;

import com.dmp.dto.UserCreate;
import com.dmp.dto.UserOut;
import com.dmp.dto.UserUpdate;
import com.dmp.exception.BadRequestException;
import com.dmp.exception.ConflictException;
import com.dmp.exception.ResourceNotFoundException;
import com.dmp.model.User;
import com.dmp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User CRUD and mapping to {@link UserOut}. Throws domain exceptions for consistent API error handling.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserOut> listUsers() {
        return userRepository.findAllByOrderByEmailAsc().stream()
                .map(this::toOut)
                .collect(Collectors.toList());
    }

    public UserOut getUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toOut(user);
    }

    @Transactional
    public UserOut createUser(UserCreate body) {
        String email = nullToEmpty(body.getEmail()).trim().toLowerCase();
        if (email.isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ConflictException("A user with this email already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setName(blankToNull(body.getName()));
        user.setRole(blankToNull(body.getRole()));
        user = userRepository.save(user);
        return toOut(user);
    }

    @Transactional
    public UserOut updateUser(int userId, UserUpdate body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (body.hasEmailUpdate()) {
            String email = nullToEmpty(body.getEmail()).trim().toLowerCase();
            if (email.isEmpty()) {
                throw new BadRequestException("Email cannot be empty");
            }
            userRepository.findByEmailIgnoreCase(email)
                    .filter(existing -> !existing.getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new ConflictException("A user with this email already exists");
                    });
            user.setEmail(email);
        }
        if (body.hasNameUpdate()) {
            user.setName(blankToNull(body.getName()));
        }
        if (body.hasRoleUpdate()) {
            user.setRole(blankToNull(body.getRole()));
        }

        user = userRepository.save(user);
        return toOut(user);
    }

    @Transactional
    public void deleteUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    public UserOut toOut(User u) {
        return new UserOut(u.getId(), u.getEmail(), u.getName(), u.getRole(), u.getCreatedAt(), u.getUpdatedAt());
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }

    private static String blankToNull(String s) {
        return s != null && !s.trim().isEmpty() ? s.trim() : null;
    }
}
