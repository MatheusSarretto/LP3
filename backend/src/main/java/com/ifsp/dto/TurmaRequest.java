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
public class TurmaRequest {

	@NotNull(message = "O ID da Disciplina é obrigatório")
    private Integer disciplinaId;

    @NotNull(message = "O ID do Professor é obrigatório")
    private Integer professorId;

    @NotBlank(message = "O período não pode ser nulo")
    private String periodo;

    private String horario;
    private String localSala;
    
}
