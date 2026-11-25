package com.exam.system.repository;

import com.exam.system.entity.Exam;
import com.exam.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByIsActiveTrue();
    List<Exam> findByCreatedBy(User user);
}
