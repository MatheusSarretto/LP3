package com.ifsp.dto;

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
public class MatriculaRequest {

	@NotNull(message = "O ID do Aluno é obrigatório")
    private Integer alunoId;

    @NotNull(message = "O ID da Turma é obrigatório")
    private Integer turmaId;
	
}
