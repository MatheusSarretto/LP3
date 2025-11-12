package com.ifsp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifsp.model.Turma;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Integer> {

	List<Turma> findByProfessorId(Integer professorId);
	
	List<Turma> findByDisciplinaId(Integer disciplinaId);
	
}
