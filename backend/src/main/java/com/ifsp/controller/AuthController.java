package com.ifsp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifsp.dto.AuthResponse;
import com.ifsp.dto.LoginRequest;
import com.ifsp.dto.RegistroRequest;
import com.ifsp.model.Usuario;
import com.ifsp.security.JwtService;
import com.ifsp.service.UserDetailsServiceImpl;
import com.ifsp.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getSenha()
            )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/registrar")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegistroRequest registroRequest) {
        Usuario novoUsuario = usuarioService.registrarNovoUsuario(registroRequest);

        UserDetails userDetails = userDetailsService.loadUserByUsername(novoUsuario.getEmail());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }
    
}
