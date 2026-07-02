package com.pfa.controller;

import com.pfa.dto.TacheDto;
import com.pfa.service.TacheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;

    @GetMapping("/projets/{projetId}/tasks")
    public ResponseEntity<List<TacheDto>> getByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(tacheService.getByProjet(projetId));
    }

    @PostMapping("/projets/{projetId}/tasks")
    public ResponseEntity<TacheDto> creer(@PathVariable Long projetId,
                                          @Valid @RequestBody TacheDto dto) {
        return ResponseEntity.ok(tacheService.creer(projetId, dto));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TacheDto> modifier(@PathVariable Long id,
                                             @RequestBody TacheDto dto) {
        return ResponseEntity.ok(tacheService.modifier(id, dto));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        tacheService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
