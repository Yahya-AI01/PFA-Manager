package com.pfa.service;

import com.pfa.dto.LoginRequest;
import com.pfa.dto.LoginResponse;
import com.pfa.dto.RegisterRequest;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.BadRequestException;
import com.pfa.repository.UtilisateurRepository;
import com.pfa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getMotDePasse())
        );
        Utilisateur user = utilisateurRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        String token = jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getNom(), user.getPrenom(), user.getEmail(), user.getRole());
    }

    public LoginResponse register(RegisterRequest req) {
        if (utilisateurRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email d\u00e9j\u00e0 utilis\u00e9");
        }
        Utilisateur user = Utilisateur.builder()
            .nom(req.getNom())
            .prenom(req.getPrenom())
            .email(req.getEmail())
            .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
            .role(req.getRole())
            .build();
        utilisateurRepo.save(user);
        String token = jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getNom(), user.getPrenom(), user.getEmail(), user.getRole());
    }
}
