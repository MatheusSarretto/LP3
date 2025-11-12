package com.ifsp.dto;

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
public class DisciplinaRequest {

	@NotBlank(message = "O nome não pode ser nulo")
    private String nome;

    @NotBlank(message = "O código da disciplina não pode ser nula")
    private String codigoDisciplina;

    private String descricao;

    @NotNull(message = "A carga horária não pode ser nula")
    private Integer cargaHoraria;
	
}
