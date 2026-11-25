package com.exam.system.controller;

import com.exam.system.dto.ResultDTO;
import com.exam.system.entity.Role;
import com.exam.system.entity.User;
import com.exam.system.repository.UserRepository;
import com.exam.system.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;
    private final UserRepository userRepository;

    @GetMapping("/{studentId}/exam/{examId}")
    public ResponseEntity<?> getResult(@PathVariable Long studentId, @PathVariable Long examId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: You can only view your own results"));
        }

        try {
            ResultDTO result = resultService.getResult(studentId, examId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{attemptId}/download")
    public ResponseEntity<?> downloadPdf(@PathVariable Long attemptId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            if (currentUser.getRole() != Role.ADMIN && !resultService.isAttemptOwnedBy(attemptId, currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied: You can only download your own certificate"));
            }
            byte[] pdfBytes = resultService.generatePdfResult(attemptId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "result_" + attemptId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
