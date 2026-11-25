package com.exam.system.controller;

import com.exam.system.entity.Role;
import com.exam.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        long studentCount = userRepository.countByRole(Role.STUDENT);
        long totalUsers = userRepository.count();
        return ResponseEntity.ok(Map.of(
                "activeStudents", studentCount,
                "totalUsers", totalUsers
        ));
    }
}
