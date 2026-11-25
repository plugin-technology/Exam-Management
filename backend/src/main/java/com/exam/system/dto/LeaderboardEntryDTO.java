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
public class LeaderboardEntryDTO {
    private Integer rank;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private LocalDateTime submittedAt;
}
