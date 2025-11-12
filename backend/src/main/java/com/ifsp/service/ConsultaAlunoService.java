package com.ifsp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifsp.exception.ResourceNotFoundException;
import com.ifsp.exception.ValidationException;
import com.ifsp.model.Matricula;
import com.ifsp.model.Nota;
import com.ifsp.model.Usuario;
import com.ifsp.repository.MatriculaRepository;
import com.ifsp.repository.NotaRepository;
import com.ifsp.repository.UsuarioRepository;

@Service
public class ConsultaAlunoService {

	@Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Buscar o usuário pelo email
    private Usuario getAlunoByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com email: " + email));
    }

    // Buscar uma matrícula pelo ID
    private Matricula getMatriculaById(Integer matriculaId) {
        return matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com ID: " + matriculaId));
    }

    // Listar todas as matrículas do aluno.
    @Transactional(readOnly = true)
    public List<Matricula> findMinhasMatriculas(String alunoEmail) {
        Usuario aluno = getAlunoByEmail(alunoEmail);
        
        return matriculaRepository.findByAlunoId(aluno.getId());
    }

    // Listar as notas de uma matrícula
    @Transactional(readOnly = true)
    public List<Nota> findMinhasNotasPorMatricula(Integer matriculaId, String alunoEmail) {
        Matricula matricula = getMatriculaById(matriculaId);
        
        Usuario aluno = getAlunoByEmail(alunoEmail);

        if (!matricula.getAluno().getId().equals(aluno.getId())) {
            throw new ValidationException("Acesso negado. Esta matrícula não pertence ao usuário autenticado.");
        }

        return notaRepository.findByMatriculaId(matriculaId);
    }
	
}
