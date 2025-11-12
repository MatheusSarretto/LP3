package com.ifsp.controller;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.ifsp.dto.MatriculaResponse;
import com.ifsp.dto.NotaRequest;
import com.ifsp.dto.NotaResponse;
import com.ifsp.dto.TurmaResponse;
import com.ifsp.model.Nota;
import com.ifsp.service.GestaoNotasService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/professor")
@PreAuthorize("hasRole('PROFESSOR')")
public class ProfessorController {

	@Autowired
    private GestaoNotasService gestaoNotasService;

    // Listar as turmas do professor logado
    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaResponse>> getMinhasTurmas(Principal principal) {
        List<TurmaResponse> response = gestaoNotasService.findTurmasByProfessor(principal.getName())
                .stream()
                .map(TurmaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Listar alunos de uma turma específica.
    @GetMapping("/turmas/{turmaId}/matriculas")
    public ResponseEntity<List<MatriculaResponse>> getMatriculasPorTurma(
            @PathVariable Integer turmaId,
            Principal principal
    ) {
        List<MatriculaResponse> response = gestaoNotasService.findMatriculasByTurma(turmaId, principal.getName())
                .stream()
                .map(MatriculaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Listar todas as notas de um aluno
    @GetMapping("/matriculas/{matriculaId}/notas")
    public ResponseEntity<List<NotaResponse>> getNotasPorMatricula(
            @PathVariable Integer matriculaId,
            Principal principal
    ) {
        List<NotaResponse> response = gestaoNotasService.findNotasByMatricula(matriculaId, principal.getName())
                .stream()
                .map(NotaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    //Lançar uma nota para uma matrícula
    @PostMapping("/matriculas/{matriculaId}/notas")
    public ResponseEntity<NotaResponse> lancarNota(
            @PathVariable Integer matriculaId,
            @Valid @RequestBody NotaRequest request,
            Principal principal
    ) {
        Nota novaNota = gestaoNotasService.lancarNota(matriculaId, request, principal.getName());
        NotaResponse response = NotaResponse.fromEntity(novaNota);

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/professor/notas/{id}")
                .buildAndExpand(response.getId())
                .toUri();
        
        return ResponseEntity.created(location).body(response);
    }

    // Atualizar uma nota.
    @PutMapping("/notas/{notaId}")
    public ResponseEntity<NotaResponse> updateNota(
            @PathVariable Integer notaId,
            @Valid @RequestBody NotaRequest request,
            Principal principal
    ) {
        Nota notaAtualizada = gestaoNotasService.updateNota(notaId, request, principal.getName());
        return ResponseEntity.ok(NotaResponse.fromEntity(notaAtualizada));
    }

    // Deletar uma nota.
    @DeleteMapping("/notas/{notaId}")
    public ResponseEntity<Void> deleteNota(
            @PathVariable Integer notaId,
            Principal principal
    ) {
        gestaoNotasService.deleteNota(notaId, principal.getName());
        return ResponseEntity.noContent().build();
    }
	
}
