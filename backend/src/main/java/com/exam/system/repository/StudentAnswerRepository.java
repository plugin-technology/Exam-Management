package com.exam.system.repository;

import com.exam.system.entity.ExamAttempt;
import com.exam.system.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttempt(ExamAttempt attempt);
}
