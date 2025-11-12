package com.ifsp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifsp.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Integer> {

	List<Matricula> findByAlunoId(Integer alunoId);
	
	List<Matricula> findByTurmaId(Integer turmaId);
	
	Optional<Matricula> findByAlunoIdAndTurmaId(Integer alunoId, Integer turmaId);
	
	boolean existsByAlunoIdAndTurmaId(Integer alunoId, Integer turmaId);
	
}
