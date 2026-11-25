package com.exam.system.service;

import com.exam.system.dto.*;
import com.exam.system.entity.*;
import com.exam.system.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserRepository userRepository;

    public ExamResponseDTO createExam(ExamDTO dto, User admin) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Exam title is required");
        }
        if (dto.getDurationMinutes() == null || dto.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0 minutes");
        }
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (dto.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("End time cannot be in the past");
        }
        if (dto.getQuestionIds() == null || dto.getQuestionIds().isEmpty()) {
            throw new IllegalArgumentException("At least one question must be assigned to the exam");
        }

        List<Long> uniqueIds = dto.getQuestionIds().stream().distinct().collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllById(uniqueIds);
        if (questions.size() != uniqueIds.size()) {
            throw new IllegalArgumentException("One or more specified question IDs do not exist");
        }

        Exam exam = Exam.builder()
                .title(sanitize(dto.getTitle()))
                .description(sanitize(dto.getDescription()))
                .durationMinutes(dto.getDurationMinutes())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .questions(questions)
                .createdBy(admin)
                .build();

        Exam saved = examRepository.save(exam);
        return mapToResponseDTO(saved, true);
    }

    @Transactional
    public ExamResponseDTO updateExam(Long id, ExamDTO dto) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Exam title is required");
        }
        if (dto.getDurationMinutes() == null || dto.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0 minutes");
        }
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (dto.getQuestionIds() != null) {
            if (dto.getQuestionIds().isEmpty()) {
                throw new IllegalArgumentException("At least one question must be assigned to the exam");
            }
            List<Long> uniqueIds = dto.getQuestionIds().stream().distinct().collect(Collectors.toList());
            List<Question> questions = questionRepository.findAllById(uniqueIds);
            if (questions.size() != uniqueIds.size()) {
                throw new IllegalArgumentException("One or more specified question IDs do not exist");
            }
            exam.setQuestions(questions);
        }

        exam.setTitle(sanitize(dto.getTitle()));
        exam.setDescription(sanitize(dto.getDescription()));
        exam.setDurationMinutes(dto.getDurationMinutes());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        if (dto.getIsActive() != null) {
            exam.setIsActive(dto.getIsActive());
        }

        Exam saved = examRepository.save(exam);
        return mapToResponseDTO(saved, true);
    }

    @Transactional
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        if (Boolean.TRUE.equals(examAttemptRepository.existsByExam(exam))) {
            throw new IllegalStateException("Cannot delete exam that already has student attempts");
        }
        examRepository.delete(exam);
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("(?is)<script.*?>.*?</script>", "")
                    .replaceAll("(?i)<\\s*/?\\s*(script|iframe|object|embed)[^>]*>", "")
                    .trim();
    }

    public ExamResponseDTO getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        return mapToResponseDTO(exam, false);
    }

    public List<ExamResponseDTO> getActiveExams() {
        return examRepository.findByIsActiveTrue().stream()
                .map(exam -> mapToResponseDTO(exam, false))
                .collect(Collectors.toList());
    }

    public List<ExamResponseDTO> getAllExams() {
        return examRepository.findAll().stream()
                .map(exam -> mapToResponseDTO(exam, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamResponseDTO startExam(Long examId, User student) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            throw new RuntimeException("This exam is currently inactive.");
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. Validate if exam has not yet started
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new RuntimeException("This assessment has not started yet. Scheduled to begin at: " + exam.getStartTime());
        }

        // 2. Validate if exam window has already concluded
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new RuntimeException("This assessment window has concluded. Submissions are no longer accepted.");
        }

        // 3. Validate single attempt rule (allow resuming an incomplete attempt)
        var existingAttempt = examAttemptRepository.findByStudentAndExam(student, exam);
        if (existingAttempt.isPresent()) {
            ExamAttempt attempt = existingAttempt.get();
            if (Boolean.TRUE.equals(attempt.getCompleted())) {
                throw new RuntimeException("You have already attempted this exam.");
            }
            if (exam.getDurationMinutes() != null && attempt.getStartedAt() != null
                    && now.isAfter(attempt.getStartedAt().plusMinutes(exam.getDurationMinutes()))) {
                throw new RuntimeException("Your allotted time for this assessment has expired.");
            }
            ExamResponseDTO dto = mapToResponseDTO(exam, false);
            dto.setStartedAt(attempt.getStartedAt());
            dto.setRemainingSeconds(computeRemainingSeconds(exam, attempt.getStartedAt(), now));
            return dto;
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .student(student)
                .exam(exam)
                .startedAt(now)
                .completed(false)
                .build();

        examAttemptRepository.save(attempt);
        ExamResponseDTO dto = mapToResponseDTO(exam, false);
        dto.setStartedAt(attempt.getStartedAt());
        dto.setRemainingSeconds(computeRemainingSeconds(exam, attempt.getStartedAt(), now));
        return dto;
    }

    private long computeRemainingSeconds(Exam exam, LocalDateTime startedAt, LocalDateTime now) {
        long durationSecs = (exam.getDurationMinutes() != null ? exam.getDurationMinutes() : 30L) * 60L;
        LocalDateTime attemptEnd = startedAt != null ? startedAt.plusSeconds(durationSecs) : now.plusSeconds(durationSecs);
        LocalDateTime effectiveEnd = attemptEnd;
        if (exam.getEndTime() != null && exam.getEndTime().isBefore(effectiveEnd)) {
            effectiveEnd = exam.getEndTime();
        }
        return Math.max(0L, java.time.Duration.between(now, effectiveEnd).getSeconds());
    }

    @Transactional
    public ResultDTO submitExam(Long examId, User student, SubmitExamRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        ExamAttempt attempt = examAttemptRepository.findByStudentAndExam(student, exam)
                .orElseThrow(() -> new RuntimeException("No active attempt found for this exam"));

        if (attempt.getCompleted()) {
            throw new RuntimeException("Exam already submitted");
        }

        LocalDateTime now = LocalDateTime.now();
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime().plusSeconds(30))) {
            throw new RuntimeException("Assessment window has concluded. Late submissions are not accepted.");
        }
        if (exam.getDurationMinutes() != null && attempt.getStartedAt() != null
                && now.isAfter(attempt.getStartedAt().plusMinutes(exam.getDurationMinutes()).plusSeconds(30))) {
            throw new RuntimeException("Time limit exceeded. Late submissions are not accepted.");
        }

        int totalScore = 0;
        int totalMarks = 0;
        List<StudentAnswer> studentAnswers = new ArrayList<>();

        if (request.getAnswers() != null) {
            for (SubmitAnswerDTO answerDTO : request.getAnswers()) {
                if (answerDTO.getQuestionId() == null) continue;

                Question question = questionRepository.findById(answerDTO.getQuestionId())
                        .orElseThrow(() -> new RuntimeException("Question not found: " + answerDTO.getQuestionId()));

                int qMarks = question.getMarks() != null ? question.getMarks() : 1;
                String correct = question.getCorrectAnswer();
                String selected = answerDTO.getSelectedAnswer();

                boolean isCorrect = correct != null && selected != null && correct.trim().equalsIgnoreCase(selected.trim());
                if (isCorrect) {
                    totalScore += qMarks;
                }
                totalMarks += qMarks;

                StudentAnswer studentAnswer = StudentAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .selectedAnswer(selected)
                        .isCorrect(isCorrect)
                        .build();
                studentAnswers.add(studentAnswer);
            }
        }

        // Also count marks for unanswered questions in the exam
        if (exam.getQuestions() != null) {
            for (Question q : exam.getQuestions()) {
                boolean answered = request.getAnswers() != null && request.getAnswers().stream()
                        .anyMatch(a -> a.getQuestionId() != null && a.getQuestionId().equals(q.getId()));
                if (!answered) {
                    int qMarks = q.getMarks() != null ? q.getMarks() : 1;
                    totalMarks += qMarks;
                }
            }
        }

        studentAnswerRepository.saveAll(studentAnswers);

        double percentage = totalMarks > 0 ? (double) totalScore / totalMarks * 100 : 0;

        attempt.setScore(totalScore);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);
        attempt.setCompleted(true);
        attempt.setSubmittedAt(LocalDateTime.now());
        examAttemptRepository.save(attempt);

        return ResultDTO.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .studentId(student.getId())
                .studentName(student.getName())
                .score(totalScore)
                .totalMarks(totalMarks)
                .percentage(percentage)
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    private ExamResponseDTO mapToResponseDTO(Exam exam, boolean includeCorrectAnswer) {
        LocalDateTime now = LocalDateTime.now();
        String computedStatus = "INACTIVE";

        if (Boolean.TRUE.equals(exam.getIsActive())) {
            if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
                computedStatus = "UPCOMING";
            } else if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
                computedStatus = "CONCLUDED";
            } else {
                computedStatus = "LIVE";
            }
        }

        List<QuestionDTO> questionDTOs = exam.getQuestions().stream()
                .map(q -> QuestionDTO.builder()
                        .id(q.getId())
                        .text(q.getText())
                        .type(q.getType())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctAnswer(includeCorrectAnswer ? q.getCorrectAnswer() : null)
                        .marks(q.getMarks())
                        .subject(q.getSubject())
                        .difficulty(q.getDifficulty())
                        .tags(q.getTags())
                        .build())
                .collect(Collectors.toList());

        return ExamResponseDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .durationMinutes(exam.getDurationMinutes())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .isActive(exam.getIsActive())
                .status(computedStatus)
                .questions(questionDTOs)
                .createdBy(exam.getCreatedBy() != null ? exam.getCreatedBy().getName() : null)
                .build();
    }
}
