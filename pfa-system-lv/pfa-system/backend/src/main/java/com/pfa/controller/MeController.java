package com.pfa.controller;

import com.pfa.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(Map.of(
            "id", user.getUtilisateur().getId(),
            "nom", user.getUtilisateur().getNom(),
            "prenom", user.getUtilisateur().getPrenom(),
            "email", user.getUtilisateur().getEmail(),
            "role", user.getUtilisateur().getRole()
        ));
    }
}
