package com.ifsp.service;

import java.util.Collection;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ifsp.model.Usuario;
import com.ifsp.repository.UsuarioRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	@Autowired
    private UsuarioRepository usuarioRepository;
	
	@Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));

        // LEMBRAR: No Spring Security as permissões são maiúsculas com prefixo "ROLE_"
        String roleName = "ROLE_" + usuario.getRole().name().toUpperCase();
        Collection<GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(roleName));

        return new User(usuario.getEmail(), usuario.getSenha(), authorities);
    }
	
}
