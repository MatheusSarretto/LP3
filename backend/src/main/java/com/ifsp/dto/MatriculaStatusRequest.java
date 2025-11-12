package com.ifsp.dto;

import java.math.BigDecimal;

import com.ifsp.model.StatusMatricula;

import jakarta.validation.constraints.NotNull;
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
public class MatriculaStatusRequest {

	@NotNull(message = "O status da matrícula não pode ser nulo")
    private StatusMatricula status;

    private BigDecimal mediaFinal;
    
    private BigDecimal frequencia;
	
}
