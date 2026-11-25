package com.exam.system.repository;

import com.exam.system.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySubject(String subject);
    List<Question> findByDifficulty(String difficulty);
    Page<Question> findBySubjectContainingIgnoreCase(String subject, Pageable pageable);
}
