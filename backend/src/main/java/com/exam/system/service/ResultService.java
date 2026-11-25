package com.exam.system.service;

import com.exam.system.dto.LeaderboardEntryDTO;
import com.exam.system.dto.ResultDTO;
import com.exam.system.entity.Exam;
import com.exam.system.entity.ExamAttempt;
import com.exam.system.entity.User;
import com.exam.system.repository.ExamAttemptRepository;
import com.exam.system.repository.ExamRepository;
import com.exam.system.repository.UserRepository;
import com.exam.system.util.PdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ExamAttemptRepository examAttemptRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    public ResultDTO getResult(Long studentId, Long examId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        ExamAttempt attempt = examAttemptRepository.findByStudentAndExam(student, exam)
                .orElseThrow(() -> new RuntimeException("No attempt found for this student and exam"));

        if (!Boolean.TRUE.equals(attempt.getCompleted())) {
            throw new RuntimeException("Exam attempt is not yet completed");
        }

        List<ExamAttempt> allAttempts = examAttemptRepository.findByExamAndCompletedTrueOrderByScoreDescSubmittedAtAsc(exam);
        int rank = 1;
        for (ExamAttempt a : allAttempts) {
            if (a.getId().equals(attempt.getId())) break;
            rank++;
        }

        return ResultDTO.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .studentId(student.getId())
                .studentName(student.getName())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .rank(rank)
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    public List<LeaderboardEntryDTO> getLeaderboard(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<ExamAttempt> attempts = examAttemptRepository.findByExamAndCompletedTrueOrderByScoreDescSubmittedAtAsc(exam);
        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
        int rank = 1;

        for (ExamAttempt attempt : attempts) {
            leaderboard.add(LeaderboardEntryDTO.builder()
                    .rank(rank++)
                    .studentId(attempt.getStudent().getId())
                    .studentName(attempt.getStudent().getName())
                    .score(attempt.getScore())
                    .totalMarks(attempt.getTotalMarks())
                    .percentage(attempt.getPercentage())
                    .submittedAt(attempt.getSubmittedAt())
                    .build());
        }
        return leaderboard;
    }

    public List<ResultDTO> getStudentHistory(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return examAttemptRepository.findByStudent(student).stream()
                .filter(ExamAttempt::getCompleted)
                .map(attempt -> ResultDTO.builder()
                        .attemptId(attempt.getId())
                        .examId(attempt.getExam().getId())
                        .examTitle(attempt.getExam().getTitle())
                        .studentId(student.getId())
                        .studentName(student.getName())
                        .score(attempt.getScore())
                        .totalMarks(attempt.getTotalMarks())
                        .percentage(attempt.getPercentage())
                        .submittedAt(attempt.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public boolean isAttemptOwnedBy(Long attemptId, Long userId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return attempt.getStudent().getId().equals(userId);
    }

    public byte[] generatePdfResult(Long attemptId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        return PdfGenerator.generateResultPdf(
                attempt.getStudent().getName(),
                attempt.getExam().getTitle(),
                attempt.getScore(),
                attempt.getTotalMarks(),
                attempt.getPercentage(),
                attempt.getSubmittedAt()
        );
    }
}
