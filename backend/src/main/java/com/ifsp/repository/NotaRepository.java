package com.ifsp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifsp.model.Nota;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Integer> {

	List<Nota> findByMatriculaId(Integer matriculaId);
	
}
