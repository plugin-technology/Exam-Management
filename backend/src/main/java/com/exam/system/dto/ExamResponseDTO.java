package com.exam.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private String status; // UPCOMING, LIVE, CONCLUDED, INACTIVE
    private List<QuestionDTO> questions;
    private String createdBy;
    private LocalDateTime startedAt;
    private Long remainingSeconds;
}
