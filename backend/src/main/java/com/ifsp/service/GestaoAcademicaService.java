package com.ifsp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifsp.dto.DisciplinaRequest;
import com.ifsp.dto.MatriculaRequest;
import com.ifsp.dto.MatriculaStatusRequest;
import com.ifsp.dto.TurmaRequest;
import com.ifsp.exception.ResourceNotFoundException;
import com.ifsp.exception.ValidationException;
import com.ifsp.model.Disciplina;
import com.ifsp.model.Matricula;
import com.ifsp.model.Role;
import com.ifsp.model.StatusMatricula;
import com.ifsp.model.Turma;
import com.ifsp.model.Usuario;
import com.ifsp.repository.DisciplinaRepository;
import com.ifsp.repository.MatriculaRepository;
import com.ifsp.repository.TurmaRepository;
import com.ifsp.repository.UsuarioRepository;

@Service
public class GestaoAcademicaService {

	@Autowired
    private DisciplinaRepository disciplinaRepository;
	
	@Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    // LÓGICA DE DISCIPLINAS
    @Transactional(readOnly = true)
    public List<Disciplina> findAllDisciplinas() {
        return disciplinaRepository.findAll();
    }
    
    @Transactional
    public Disciplina createDisciplina(DisciplinaRequest request) {
        
        Disciplina disciplina = new Disciplina();
        disciplina.setNome(request.getNome());
        disciplina.setCodigoDisciplina(request.getCodigoDisciplina());
        disciplina.setDescricao(request.getDescricao());
        disciplina.setCargaHoraria(request.getCargaHoraria());

        return disciplinaRepository.save(disciplina);
    }

    @Transactional(readOnly = true)
    public Disciplina findDisciplinaById(Integer id) {
        return disciplinaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada com ID: " + id));
    }

    @Transactional
    public Disciplina updateDisciplina(Integer id, DisciplinaRequest request) {
        Disciplina disciplina = findDisciplinaById(id);

        disciplina.setNome(request.getNome());
        disciplina.setCodigoDisciplina(request.getCodigoDisciplina());
        disciplina.setDescricao(request.getDescricao());
        disciplina.setCargaHoraria(request.getCargaHoraria());

        return disciplinaRepository.save(disciplina);
    }

    @Transactional
    public void deleteDisciplina(Integer id) {
        Disciplina disciplina = findDisciplinaById(id);
        
        disciplinaRepository.delete(disciplina);
    }
    
 // LÓGICA DE TURMAS
    @Transactional(readOnly = true)
    public List<Turma> findAllTurmas() {
        return turmaRepository.findAll();
    }
    
    @Transactional
    public Turma createTurma(TurmaRequest request) {
        Disciplina disciplina = findDisciplinaById(request.getDisciplinaId());

        Usuario professor = usuarioRepository.findByIdAndRole(request.getProfessorId(), Role.professor)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Professor não encontrado com ID: " + request.getProfessorId() + " ou usuário não é um Professor."
                ));

        Turma turma = new Turma();
        turma.setDisciplina(disciplina);
        turma.setProfessor(professor);
        turma.setPeriodo(request.getPeriodo());
        turma.setHorario(request.getHorario());
        turma.setLocalSala(request.getLocalSala());

        return turmaRepository.save(turma);
    }

    @Transactional(readOnly = true)
    public Turma findTurmaById(Integer id) {
        return turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com ID: " + id));
    }

    @Transactional
    public Turma updateTurma(Integer id, TurmaRequest request) {
        Turma turma = findTurmaById(id);
        
        if (!turma.getDisciplina().getId().equals(request.getDisciplinaId())) {
            Disciplina disciplina = findDisciplinaById(request.getDisciplinaId());
            turma.setDisciplina(disciplina);
        }
        if (!turma.getProfessor().getId().equals(request.getProfessorId())) {
            Usuario professor = usuarioRepository.findByIdAndRole(request.getProfessorId(), Role.professor)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado com ID: " + request.getProfessorId()));
            turma.setProfessor(professor);
        }
        
        turma.setPeriodo(request.getPeriodo());
        turma.setHorario(request.getHorario());
        turma.setLocalSala(request.getLocalSala());

        return turmaRepository.save(turma);
    }
    
    @Transactional
    public void deleteTurma(Integer id) {
        Turma turma = findTurmaById(id);
        
        turmaRepository.delete(turma);
    }

    // LÓGICA DE MATRÍCULAS
    @Transactional(readOnly = true)
    public List<Matricula> findAllMatriculas() {
        return matriculaRepository.findAll();
    }
    
    @Transactional
    public Matricula createMatricula(MatriculaRequest request) {
        Usuario aluno = usuarioRepository.findByIdAndRole(request.getAlunoId(), Role.aluno)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aluno não encontrado com ID: " + request.getAlunoId() + " ou usuário não é um Aluno."
                ));
        
        Turma turma = findTurmaById(request.getTurmaId());

        if (matriculaRepository.existsByAlunoIdAndTurmaId(request.getAlunoId(), request.getTurmaId())) {
            throw new ValidationException("Aluno já matriculado nesta turma.");
        }

        Matricula matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setTurma(turma);
        matricula.setStatus(StatusMatricula.cursando);

        return matriculaRepository.save(matricula);
    }

    @Transactional(readOnly = true)
    public Matricula findMatriculaById(Integer id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com ID: " + id));
    }
    
    @Transactional
    public Matricula updateMatriculaStatus(Integer id, MatriculaStatusRequest request) {
        Matricula matricula = findMatriculaById(id);
        
        matricula.setStatus(request.getStatus());
        matricula.setMediaFinal(request.getMediaFinal());
        matricula.setFrequencia(request.getFrequencia());
        
        return matriculaRepository.save(matricula);
    }
    
    @Transactional
    public void deleteMatricula(Integer id) {
        Matricula matricula = findMatriculaById(id);

        matriculaRepository.delete(matricula);
    }
    
}
