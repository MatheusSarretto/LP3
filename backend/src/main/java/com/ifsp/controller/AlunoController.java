package com.ifsp.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifsp.dto.MatriculaResponse;
import com.ifsp.dto.NotaResponse;
import com.ifsp.service.ConsultaAlunoService;

@RestController
@RequestMapping("/api/aluno")
@PreAuthorize("hasRole('ALUNO')")
public class AlunoController {

	@Autowired
    private ConsultaAlunoService consultaAlunoService;

    // Listar todas as matrículas do aluno.
    @GetMapping("/matriculas")
    public ResponseEntity<List<MatriculaResponse>> getMinhasMatriculas(Principal principal) {
        List<MatriculaResponse> response = consultaAlunoService.findMinhasMatriculas(principal.getName())
                .stream()
                .map(MatriculaResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Listar as notas de uma matrícula
    @GetMapping("/matriculas/{matriculaId}/notas")
    public ResponseEntity<List<NotaResponse>> getMinhasNotasPorMatricula(
            @PathVariable Integer matriculaId,
            Principal principal
    ) {
        List<NotaResponse> response = consultaAlunoService.findMinhasNotasPorMatricula(matriculaId, principal.getName())
                .stream()
                .map(NotaResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
	
}
