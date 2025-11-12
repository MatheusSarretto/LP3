package com.ifsp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ifsp.model.Role;
import com.ifsp.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

	Optional<Usuario> findByEmail(String email);
	
	List<Usuario> findByRole(Role role);
	
	Optional<Usuario> findByIdAndRole(Integer id, Role role);
	
}
