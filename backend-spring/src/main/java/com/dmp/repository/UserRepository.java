package com.dmp.repository;

import com.dmp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** JPA repository for {@link User}. */
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findFirstByRoleOrderByEmailAsc(String role);

    List<User> findAllByOrderByEmailAsc();
}
