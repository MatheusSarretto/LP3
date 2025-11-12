package com.ifsp.dto;

import com.ifsp.model.Turma;

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
public class TurmaResponse {

	private Integer id;
    private String periodo;
    private String horario;
    private String localSala;
    private DisciplinaResponse disciplina;
    private UsuarioResponse professor;

    public static TurmaResponse fromEntity(Turma turma) {
        TurmaResponse dto = new TurmaResponse();
        dto.setId(turma.getId());
        dto.setPeriodo(turma.getPeriodo());
        dto.setHorario(turma.getHorario());
        dto.setLocalSala(turma.getLocalSala());
        dto.setDisciplina(DisciplinaResponse.fromEntity(turma.getDisciplina()));
        dto.setProfessor(UsuarioResponse.fromEntity(turma.getProfessor()));
        
        return dto;
    }
	
}
