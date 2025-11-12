package com.ifsp.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ErrorResponse {

	private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
	
}
