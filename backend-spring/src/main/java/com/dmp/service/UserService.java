package com.dmp.service;

import com.dmp.dto.UserCreate;
import com.dmp.dto.UserOut;
import com.dmp.dto.UserUpdate;
import com.dmp.model.User;
import com.dmp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

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
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        return toOut(user);
    }

    @Transactional
    public UserOut createUser(UserCreate body) {
        String email = (body.getEmail() != null ? body.getEmail() : "").trim().toLowerCase();
        if (email.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is required");
        }
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "A user with this email already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setName(body.getName() != null && !body.getName().trim().isEmpty() ? body.getName().trim() : null);
        user.setRole(body.getRole() != null && !body.getRole().trim().isEmpty() ? body.getRole().trim() : null);
        user = userRepository.save(user);
        return toOut(user);
    }

    @Transactional
    public UserOut updateUser(int userId, UserUpdate body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (body.hasEmailUpdate()) {
            String email = (body.getEmail() != null ? body.getEmail() : "").trim().toLowerCase();
            if (email.isEmpty()) {
                throw new ResponseStatusException(BAD_REQUEST, "Email cannot be empty");
            }
            var existing = userRepository.findByEmailIgnoreCase(email);
            if (existing.isPresent() && !existing.get().getId().equals(userId)) {
                throw new ResponseStatusException(CONFLICT, "A user with this email already exists");
            }
            user.setEmail(email);
        }
        if (body.hasNameUpdate()) {
            user.setName(body.getName() != null && !body.getName().trim().isEmpty() ? body.getName().trim() : null);
        }
        if (body.hasRoleUpdate()) {
            user.setRole(body.getRole() != null && !body.getRole().trim().isEmpty() ? body.getRole().trim() : null);
        }

        user = userRepository.save(user);
        return toOut(user);
    }

    @Transactional
    public void deleteUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        userRepository.delete(user);
    }

    public UserOut toOut(User u) {
        return new UserOut(u.getId(), u.getEmail(), u.getName(), u.getRole(), u.getCreatedAt(), u.getUpdatedAt());
    }
}
