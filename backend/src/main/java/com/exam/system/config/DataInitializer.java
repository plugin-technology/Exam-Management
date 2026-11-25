package com.exam.system.config;

import com.exam.system.entity.Role;
import com.exam.system.entity.User;
import com.exam.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure default administrator exists so user can log in to admin panel
        if (!userRepository.existsByEmail("admin@exam.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@exam.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin initialized: admin@exam.com");
        }
    }
}
