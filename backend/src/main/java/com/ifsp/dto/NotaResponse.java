package com.ifsp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.ifsp.model.Nota;

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
public class NotaResponse {

	private Integer id;
    private String descricao;
    private BigDecimal valorNota;
    private BigDecimal peso;
    private LocalDate dataAvaliacao;
    private Integer matriculaId;

    public static NotaResponse fromEntity(Nota nota) {
        NotaResponse dto = new NotaResponse();
        dto.setId(nota.getId());
        dto.setDescricao(nota.getDescricao());
        dto.setValorNota(nota.getValorNota());
        dto.setPeso(nota.getPeso());
        dto.setDataAvaliacao(nota.getDataAvaliacao());
        dto.setMatriculaId(nota.getMatricula().getId());
        return dto;
    }
	
}
