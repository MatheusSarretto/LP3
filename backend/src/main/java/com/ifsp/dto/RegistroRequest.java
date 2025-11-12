package com.ifsp.dto;

import com.ifsp.model.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RegistroRequest {

	private String nome;
    private String email;
    private String senha;
    private Role role;
    
}
