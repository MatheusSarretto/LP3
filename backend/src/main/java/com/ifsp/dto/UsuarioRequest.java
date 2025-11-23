package com.ifsp.dto;

import com.ifsp.model.Role;

import lombok.Data;

@Data
public class UsuarioRequest {
	
	 private String nome;
	 private String email;
	 private String senha;
	 private Role role;
	 
}