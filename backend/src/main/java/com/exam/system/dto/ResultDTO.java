package com.exam.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDTO {
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private Integer rank;
    private LocalDateTime submittedAt;
}
