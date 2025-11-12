package com.ifsp.dto;

import java.math.BigDecimal;

import com.ifsp.model.Matricula;
import com.ifsp.model.StatusMatricula;

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
public class MatriculaResponse {

	private Integer id;
    private BigDecimal mediaFinal;
    private BigDecimal frequencia;
    private StatusMatricula status;
    private UsuarioResponse aluno;
    private TurmaResponse turma;

    public static MatriculaResponse fromEntity(Matricula matricula) {
        MatriculaResponse dto = new MatriculaResponse();
        dto.setId(matricula.getId());
        dto.setMediaFinal(matricula.getMediaFinal());
        dto.setFrequencia(matricula.getFrequencia());
        dto.setStatus(matricula.getStatus());
        dto.setAluno(UsuarioResponse.fromEntity(matricula.getAluno()));
        dto.setTurma(TurmaResponse.fromEntity(matricula.getTurma()));
        
        return dto;
    }
	
}
