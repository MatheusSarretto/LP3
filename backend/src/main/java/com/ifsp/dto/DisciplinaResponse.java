package com.ifsp.dto;

import com.ifsp.model.Disciplina;

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
public class DisciplinaResponse {

	private Integer id;
    private String nome;
    private String codigoDisciplina;
    private String descricao;
    private Integer cargaHoraria;

    public static DisciplinaResponse fromEntity(Disciplina disciplina) {
        DisciplinaResponse dto = new DisciplinaResponse();
        dto.setId(disciplina.getId());
        dto.setNome(disciplina.getNome());
        dto.setCodigoDisciplina(disciplina.getCodigoDisciplina());
        dto.setDescricao(disciplina.getDescricao());
        dto.setCargaHoraria(disciplina.getCargaHoraria());
        return dto;
    }
	
}
