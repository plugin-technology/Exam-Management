package com.exam.system.dto;

import lombok.Data;

@Data
public class SubmitAnswerDTO {
    private Long questionId;
    private String selectedAnswer;
}
