package com.ifsp.controller;

import java.net.URI;
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

import com.ifsp.dto.DisciplinaRequest;
import com.ifsp.dto.DisciplinaResponse;
import com.ifsp.dto.MatriculaRequest;
import com.ifsp.dto.MatriculaResponse;
import com.ifsp.dto.MatriculaStatusRequest;
import com.ifsp.dto.TurmaRequest;
import com.ifsp.dto.TurmaResponse;
import com.ifsp.model.Disciplina;
import com.ifsp.model.Matricula;
import com.ifsp.model.Turma;
import com.ifsp.service.GestaoAcademicaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRADOR')") 
public class AdminController {

	@Autowired
	private GestaoAcademicaService gestaoService;
	
	// ENDPOINTS DISCIPLINA
	@GetMapping("/disciplinas")
    public ResponseEntity<List<DisciplinaResponse>> getAllDisciplinas() {
        List<Disciplina> disciplinas = gestaoService.findAllDisciplinas();
        List<DisciplinaResponse> response = disciplinas.stream()
                .map(DisciplinaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
	
	@PostMapping("/disciplinas")
    public ResponseEntity<DisciplinaResponse> createDisciplina(@Valid @RequestBody DisciplinaRequest request) {
        Disciplina novaDisciplina = gestaoService.createDisciplina(request);
        DisciplinaResponse response = DisciplinaResponse.fromEntity(novaDisciplina);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

	@GetMapping("/disciplinas/{id}")
    public ResponseEntity<DisciplinaResponse> getDisciplinaById(@PathVariable Integer id) {
        Disciplina disciplina = gestaoService.findDisciplinaById(id);
        return ResponseEntity.ok(DisciplinaResponse.fromEntity(disciplina));
    }
	
	@PutMapping("/disciplinas/{id}")
    public ResponseEntity<DisciplinaResponse> updateDisciplina(
            @PathVariable Integer id, 
            @Valid @RequestBody DisciplinaRequest request
    ) {
        Disciplina disciplinaAtualizada = gestaoService.updateDisciplina(id, request);
        return ResponseEntity.ok(DisciplinaResponse.fromEntity(disciplinaAtualizada));
    }
	
	@DeleteMapping("/disciplinas/{id}")
    public ResponseEntity<Void> deleteDisciplina(@PathVariable Integer id) {
        gestaoService.deleteDisciplina(id);
        return ResponseEntity.noContent().build();
    }
	
	// ENDPOINTS TURMA
    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaResponse>> getAllTurmas() {
        List<TurmaResponse> response = gestaoService.findAllTurmas().stream()
                .map(TurmaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/turmas")
    public ResponseEntity<TurmaResponse> createTurma(@Valid @RequestBody TurmaRequest request) {
        Turma novaTurma = gestaoService.createTurma(request);
        TurmaResponse response = TurmaResponse.fromEntity(novaTurma);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.getId()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/turmas/{id}")
    public ResponseEntity<TurmaResponse> getTurmaById(@PathVariable Integer id) {
        Turma turma = gestaoService.findTurmaById(id);
        return ResponseEntity.ok(TurmaResponse.fromEntity(turma));
    }

    @PutMapping("/turmas/{id}")
    public ResponseEntity<TurmaResponse> updateTurma(
            @PathVariable Integer id, 
            @Valid @RequestBody TurmaRequest request
    ) {
        Turma turmaAtualizada = gestaoService.updateTurma(id, request);
        return ResponseEntity.ok(TurmaResponse.fromEntity(turmaAtualizada));
    }

    @DeleteMapping("/turmas/{id}")
    public ResponseEntity<Void> deleteTurma(@PathVariable Integer id) {
        gestaoService.deleteTurma(id);
        return ResponseEntity.noContent().build();
    }

    // ENDPOINTS MATRÍCULA
    @GetMapping("/matriculas")
    public ResponseEntity<List<MatriculaResponse>> getAllMatriculas() {
        List<MatriculaResponse> response = gestaoService.findAllMatriculas().stream()
                .map(MatriculaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/matriculas")
    public ResponseEntity<MatriculaResponse> createMatricula(@Valid @RequestBody MatriculaRequest request) {
        Matricula novaMatricula = gestaoService.createMatricula(request);
        MatriculaResponse response = MatriculaResponse.fromEntity(novaMatricula);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.getId()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/matriculas/{id}")
    public ResponseEntity<MatriculaResponse> getMatriculaById(@PathVariable Integer id) {
        Matricula matricula = gestaoService.findMatriculaById(id);
        return ResponseEntity.ok(MatriculaResponse.fromEntity(matricula));
    }

    @PutMapping("/matriculas/{id}/status")
    public ResponseEntity<MatriculaResponse> updateMatriculaStatus(
            @PathVariable Integer id,
            @Valid @RequestBody MatriculaStatusRequest request
    ) {
        Matricula matriculaAtualizada = gestaoService.updateMatriculaStatus(id, request);
        return ResponseEntity.ok(MatriculaResponse.fromEntity(matriculaAtualizada));
    }

    @DeleteMapping("/matriculas/{id}")
    public ResponseEntity<Void> deleteMatricula(@PathVariable Integer id) {
        gestaoService.deleteMatricula(id);
        return ResponseEntity.noContent().build();
    }
	
}
