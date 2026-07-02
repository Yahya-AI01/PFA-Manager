package com.pfa.controller;

import com.pfa.entity.Module;
import com.pfa.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleRepository moduleRepo;

    @GetMapping
    public ResponseEntity<List<Module>> getAll() {
        return ResponseEntity.ok(moduleRepo.findAll());
    }
}
