package com.exam.system.repository;

import com.exam.system.entity.Exam;
import com.exam.system.entity.ExamAttempt;
import com.exam.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByStudent(User student);
    Optional<ExamAttempt> findByStudentAndExam(User student, Exam exam);
    List<ExamAttempt> findByExamOrderByScoreDescSubmittedAtAsc(Exam exam);
    List<ExamAttempt> findByExamAndCompletedTrueOrderByScoreDescSubmittedAtAsc(Exam exam);
    Boolean existsByStudentAndExam(User student, Exam exam);
    Boolean existsByExam(Exam exam);
}
