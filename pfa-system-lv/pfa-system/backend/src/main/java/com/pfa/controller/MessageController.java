package com.pfa.controller;

import com.pfa.dto.MessageDto;
import com.pfa.security.CustomUserDetails;
import com.pfa.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets/{projetId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageDto>> lister(
            @PathVariable Long projetId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(messageService.listerEtMarquerLus(projetId, user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<MessageDto> envoyer(
            @PathVariable Long projetId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(
            messageService.envoyer(projetId, body.get("contenu"), user.getUsername())
        );
    }

    @GetMapping("/non-lus")
    public ResponseEntity<Map<String, Long>> nonLus(
            @PathVariable Long projetId,
            @AuthenticationPrincipal CustomUserDetails user) {
        long count = messageService.compterNonLus(projetId, user.getUsername());
        return ResponseEntity.ok(Map.of("count", count));
    }
}
