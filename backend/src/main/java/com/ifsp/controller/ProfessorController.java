package com.ifsp.controller;

import java.io.IOException;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
import com.ifsp.service.RelatorioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/professor")
@PreAuthorize("hasRole('PROFESSOR')")
public class ProfessorController {

	@Autowired
    private GestaoNotasService gestaoNotasService;
	
	@Autowired
    private RelatorioService relatorioService;

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
    
    @PatchMapping("/matriculas/{id}/frequencia")
    public ResponseEntity<Void> updateFrequencia(
            @PathVariable Integer id, 
            @RequestBody java.util.Map<String, java.math.BigDecimal> body, // Recebe JSON simples { "frequencia": 80.5 }
            Principal principal
    ) {
        gestaoNotasService.updateFrequencia(id, body.get("frequencia"), principal.getName());
        return ResponseEntity.noContent().build();
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
    
    // Relatório Excel
    @GetMapping("/turmas/{turmaId}/relatorio/excel")
    public ResponseEntity<byte[]> getRelatorioTurma(
            @PathVariable Integer turmaId,
            Principal principal
    ) {
        try {
            byte[] excelBytes = relatorioService.gerarExcelRelatorioTurma(turmaId, principal.getName());

            String filename = "relatorio_turma_" + turmaId + ".xlsx";

            HttpHeaders headers = new HttpHeaders();
            
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Relatório PDF
    @GetMapping("/turmas/{turmaId}/relatorio/pdf")
    public ResponseEntity<byte[]> getRelatorioTurmaPdf(@PathVariable Integer turmaId, Principal principal) {
        byte[] pdfBytes = relatorioService.gerarPdfRelatorioTurma(turmaId, principal.getName());
        String filename = "relatorio_turma_" + turmaId + ".pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
	
}
