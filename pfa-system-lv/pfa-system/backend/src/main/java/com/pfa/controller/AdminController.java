package com.pfa.controller;

import com.pfa.dto.RegisterRequest;
import com.pfa.entity.Module;
import com.pfa.entity.Role;
import com.pfa.entity.Utilisateur;
import com.pfa.repository.ModuleRepository;
import com.pfa.repository.UtilisateurRepository;
import com.pfa.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UtilisateurRepository utilisateurRepo;
    private final ModuleRepository moduleRepo;
    private final AuthService authService;

    // ----- Utilisateurs -----
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<Map<String, Object>>> listerUtilisateurs() {
        List<Map<String, Object>> users = utilisateurRepo.findAll().stream()
            .map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "nom", u.getNom(),
                "prenom", u.getPrenom(),
                "email", u.getEmail(),
                "role", u.getRole()
            )).toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/utilisateurs")
    public ResponseEntity<?> creerUtilisateur(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> supprimerUtilisateur(@PathVariable Long id) {
        utilisateurRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/utilisateurs/role/{role}")
    public ResponseEntity<List<Utilisateur>> parRole(@PathVariable Role role) {
        return ResponseEntity.ok(utilisateurRepo.findByRole(role));
    }

    // ----- Modules -----
    @GetMapping("/modules")
    public ResponseEntity<List<Module>> listerModules() {
        return ResponseEntity.ok(moduleRepo.findAll());
    }

    @PostMapping("/modules")
    public ResponseEntity<Module> creerModule(@RequestBody Module module) {
        return ResponseEntity.ok(moduleRepo.save(module));
    }

    @DeleteMapping("/modules/{id}")
    public ResponseEntity<Void> supprimerModule(@PathVariable Long id) {
        moduleRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
