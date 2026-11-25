package com.exam.system.controller;

import com.exam.system.dto.ResultDTO;
import com.exam.system.entity.Role;
import com.exam.system.entity.User;
import com.exam.system.repository.UserRepository;
import com.exam.system.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final ResultService resultService;
    private final UserRepository userRepository;

    @GetMapping("/{studentId}/history")
    public ResponseEntity<?> getExamHistory(@PathVariable Long studentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: You can only view your own exam history"));
        }

        List<ResultDTO> history = resultService.getStudentHistory(studentId);
        return ResponseEntity.ok(history);
    }
}
