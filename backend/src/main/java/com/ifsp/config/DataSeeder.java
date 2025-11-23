package com.ifsp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ifsp.model.Role;
import com.ifsp.model.Usuario;
import com.ifsp.repository.UsuarioRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.count() == 0) {

                // ADMINISTRADOR
                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setEmail("admin@ifsp.edu.br");
                admin.setSenha(passwordEncoder.encode("senha"));
                admin.setRole(Role.administrador);
                usuarioRepository.save(admin);

                // PROFESSOR
                Usuario prof = new Usuario();
                prof.setNome("Professor Teste");
                prof.setEmail("professorteste@ifsp.edu.br");
                prof.setSenha(passwordEncoder.encode("senha"));
                prof.setRole(Role.professor);
                usuarioRepository.save(prof);

                // ALUNO
                Usuario aluno = new Usuario();
                aluno.setNome("Aluno Teste");
                aluno.setEmail("alunoteste@ifsp.edu.br");
                aluno.setSenha(passwordEncoder.encode("senha"));
                aluno.setRole(Role.aluno);
                usuarioRepository.save(aluno);

            }
        };
    }
}