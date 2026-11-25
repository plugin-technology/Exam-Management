package com.exam.system.service;

import com.exam.system.dto.QuestionDTO;
import com.exam.system.entity.Question;
import com.exam.system.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionDTO createQuestion(QuestionDTO dto) {
        validateQuestionDTO(dto);
        Question question = mapToEntity(dto);
        Question saved = questionRepository.save(question);
        return mapToDTO(saved);
    }

    public Page<QuestionDTO> getAllQuestions(String subject, Pageable pageable) {
        Page<Question> questions;
        if (subject != null && !subject.isEmpty()) {
            questions = questionRepository.findBySubjectContainingIgnoreCase(subject, pageable);
        } else {
            questions = questionRepository.findAll(pageable);
        }
        return questions.map(this::mapToDTO);
    }

    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return mapToDTO(question);
    }

    public QuestionDTO updateQuestion(Long id, QuestionDTO dto) {
        validateQuestionDTO(dto);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        applyOptionsFromList(dto);
        question.setText(sanitize(dto.getText()));
        question.setType(dto.getType() != null ? dto.getType() : "MCQ");
        question.setOptionA(sanitize(dto.getOptionA()));
        question.setOptionB(sanitize(dto.getOptionB()));
        question.setOptionC(sanitize(dto.getOptionC()));
        question.setOptionD(sanitize(dto.getOptionD()));
        question.setCorrectAnswer(sanitize(dto.getCorrectAnswer()));
        question.setMarks(dto.getMarks() != null ? dto.getMarks() : 1);
        question.setSubject(sanitize(dto.getSubject()));
        question.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "EASY");
        question.setTags(sanitize(dto.getTags()));

        Question updated = questionRepository.save(question);
        return mapToDTO(updated);
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .type(question.getType())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .correctAnswer(question.getCorrectAnswer())
                .marks(question.getMarks())
                .subject(question.getSubject())
                .difficulty(question.getDifficulty())
                .tags(question.getTags())
                .build();
    }

    private void validateQuestionDTO(QuestionDTO dto) {
        if (dto.getText() == null || dto.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Question text is required");
        }
        if (dto.getCorrectAnswer() == null || dto.getCorrectAnswer().trim().isEmpty()) {
            throw new IllegalArgumentException("Correct answer is required");
        }
        if (dto.getMarks() != null && dto.getMarks() < 1) {
            throw new IllegalArgumentException("Marks must be at least 1");
        }
    }

    private void applyOptionsFromList(QuestionDTO dto) {
        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            if (dto.getOptionA() == null && dto.getOptions().size() > 0) dto.setOptionA(dto.getOptions().get(0));
            if (dto.getOptionB() == null && dto.getOptions().size() > 1) dto.setOptionB(dto.getOptions().get(1));
            if (dto.getOptionC() == null && dto.getOptions().size() > 2) dto.setOptionC(dto.getOptions().get(2));
            if (dto.getOptionD() == null && dto.getOptions().size() > 3) dto.setOptionD(dto.getOptions().get(3));
        }
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("(?is)<script.*?>.*?</script>", "")
                    .replaceAll("(?i)<\\s*/?\\s*(script|iframe|object|embed)[^>]*>", "")
                    .trim();
    }

    private Question mapToEntity(QuestionDTO dto) {
        applyOptionsFromList(dto);
        return Question.builder()
                .text(sanitize(dto.getText()))
                .type(dto.getType() != null ? dto.getType() : "MCQ")
                .optionA(sanitize(dto.getOptionA()))
                .optionB(sanitize(dto.getOptionB()))
                .optionC(sanitize(dto.getOptionC()))
                .optionD(sanitize(dto.getOptionD()))
                .correctAnswer(sanitize(dto.getCorrectAnswer()))
                .marks(dto.getMarks() != null ? dto.getMarks() : 1)
                .subject(sanitize(dto.getSubject()))
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "EASY")
                .tags(sanitize(dto.getTags()))
                .build();
    }
}
