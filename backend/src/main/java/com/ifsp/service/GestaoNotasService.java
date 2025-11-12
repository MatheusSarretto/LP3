package com.ifsp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifsp.dto.NotaRequest;
import com.ifsp.exception.ResourceNotFoundException;
import com.ifsp.exception.ValidationException;
import com.ifsp.model.Matricula;
import com.ifsp.model.Nota;
import com.ifsp.model.Turma;
import com.ifsp.model.Usuario;
import com.ifsp.repository.MatriculaRepository;
import com.ifsp.repository.NotaRepository;
import com.ifsp.repository.TurmaRepository;
import com.ifsp.repository.UsuarioRepository;

@Service
public class GestaoNotasService {

	@Autowired
    private NotaRepository notaRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // LÓGICA DE TURMAS E MATRÍCULAS
    @Transactional(readOnly = true)
    public List<Turma> findTurmasByProfessor(String professorEmail) {
        Usuario professor = usuarioRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado com email: " + professorEmail));
        
        return turmaRepository.findByProfessorId(professor.getId());
    }

    @Transactional(readOnly = true)
    public List<Matricula> findMatriculasByTurma(Integer turmaId, String professorEmail) {
        checkProfessorAccess(turmaId, professorEmail);
        
        return matriculaRepository.findByTurmaId(turmaId);
    }

    // LÓGICA DE NOTAS
    @Transactional(readOnly = true)
    public List<Nota> findNotasByMatricula(Integer matriculaId, String professorEmail) {
        Matricula matricula = findMatriculaById(matriculaId);
        checkProfessorAccess(matricula.getTurma().getId(), professorEmail);
        
        return notaRepository.findByMatriculaId(matriculaId);
    }

    @Transactional
    public Nota lancarNota(Integer matriculaId, NotaRequest request, String professorEmail) {
        Matricula matricula = findMatriculaById(matriculaId);
        
        checkProfessorAccess(matricula.getTurma().getId(), professorEmail);

        Nota nota = new Nota();
        nota.setMatricula(matricula);
        nota.setDescricao(request.getDescricao());
        nota.setValorNota(request.getValorNota());
        nota.setPeso(request.getPeso());
        nota.setDataAvaliacao(request.getDataAvaliacao());
        
        Nota notaSalva = notaRepository.save(nota);

        recalcularMediaFinal(matricula);

        return notaSalva;
    }

    @Transactional
    public Nota updateNota(Integer notaId, NotaRequest request, String professorEmail) {
        Nota nota = findNotaById(notaId);

        checkProfessorAccess(nota.getMatricula().getTurma().getId(), professorEmail);

        nota.setDescricao(request.getDescricao());
        nota.setValorNota(request.getValorNota());
        nota.setPeso(request.getPeso());
        nota.setDataAvaliacao(request.getDataAvaliacao());

        Nota notaSalva = notaRepository.save(nota);
        
        recalcularMediaFinal(nota.getMatricula());

        return notaSalva;
    }

    @Transactional
    public void deleteNota(Integer notaId, String professorEmail) {
        Nota nota = findNotaById(notaId);
        Matricula matricula = nota.getMatricula();
        
        checkProfessorAccess(matricula.getTurma().getId(), professorEmail);

        notaRepository.delete(nota);
        
        recalcularMediaFinal(matricula);
    }

    // FINDBYID
    private Nota findNotaById(Integer notaId) {
        return notaRepository.findById(notaId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota não encontrada com ID: " + notaId));
    }

    private Matricula findMatriculaById(Integer matriculaId) {
         return matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com ID: " + matriculaId));
    }

    // Verificar se o professor autenticado é o mesmo da turma
    private void checkProfessorAccess(Integer turmaId, String professorEmail) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com ID: " + turmaId));
        
        if (!turma.getProfessor().getEmail().equals(professorEmail)) {
            throw new ValidationException("Acesso negado. O professor não é responsável por esta turma.");
        }
    }

    //Calcular a média ponderada final
    private void recalcularMediaFinal(Matricula matricula) {
        List<Nota> notas = notaRepository.findByMatriculaId(matricula.getId());

        if (notas.isEmpty()) {
            matricula.setMediaFinal(null);
            matriculaRepository.save(matricula);
            return;
        }

        BigDecimal somaPesos = BigDecimal.ZERO;
        BigDecimal somaNotasPonderadas = BigDecimal.ZERO;

        for (Nota nota : notas) {
            somaPesos = somaPesos.add(nota.getPeso());
            BigDecimal notaPonderada = nota.getValorNota().multiply(nota.getPeso());
            somaNotasPonderadas = somaNotasPonderadas.add(notaPonderada);
        }

        BigDecimal mediaFinal;
        if (somaPesos.compareTo(BigDecimal.ZERO) == 0) {
            mediaFinal = BigDecimal.ZERO; 
        } else {
            mediaFinal = somaNotasPonderadas.divide(somaPesos, 2, RoundingMode.HALF_UP);
        }

        matricula.setMediaFinal(mediaFinal);
        matriculaRepository.save(matricula);
    }
	
}
