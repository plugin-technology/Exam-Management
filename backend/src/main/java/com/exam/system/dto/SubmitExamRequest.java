package com.exam.system.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmitExamRequest {
    private List<SubmitAnswerDTO> answers;
}
