package com.ifsp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class NotaRequest {

	@NotBlank(message = "A descrição não pode ser nula")
    private String descricao;

    @NotNull(message = "O valor da nota não pode ser nulo")
    @DecimalMin(value = "0.0", message = "A nota não pode ser menor que 0.0")
    @DecimalMax(value = "10.0", message = "A nota não pode ser maior que 10.0")
    private BigDecimal valorNota;

    @NotNull(message = "O peso da nota não pode ser nulo")
    @DecimalMin(value = "0.01", message = "O peso deve ser maior que 0.0")
    @DecimalMax(value = "1.0", message = "O peso não pode ser maior que 1.0")
    private BigDecimal peso;

    private LocalDate dataAvaliacao;
	
}
