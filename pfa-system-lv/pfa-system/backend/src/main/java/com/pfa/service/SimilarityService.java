package com.pfa.service;

import com.pfa.dto.SimilariteDto;
import com.pfa.entity.Sujet;
import com.pfa.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimilarityService {

    private final SujetRepository sujetRepo;

    @Value("${app.ai.url}")
    private String aiUrl;

    public List<SimilariteDto> trouverSimilaires(Long sujetId, int topK) {
        Sujet cible = sujetRepo.findById(sujetId).orElse(null);
        if (cible == null) return List.of();

        List<Sujet> autres = sujetRepo.findAll().stream()
            .filter(s -> !s.getId().equals(sujetId))
            .toList();
        if (autres.isEmpty()) return List.of();

        try {
            RestClient client = RestClient.create();
            Map<String, Object> body = new HashMap<>();
            body.put("query", cible.getTitre() + " " + (cible.getDescription() == null ? "" : cible.getDescription()));
            body.put("documents", autres.stream().map(s -> Map.of(
                "id", s.getId(),
                "text", s.getTitre() + " " + (s.getDescription() == null ? "" : s.getDescription())
            )).toList());
            body.put("top_k", topK);

            @SuppressWarnings("unchecked")
            Map<String, Object> resp = client.post()
                .uri(aiUrl + "/similarity")
                .body(body)
                .retrieve()
                .body(Map.class);

            if (resp == null || !resp.containsKey("results")) return List.of();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) resp.get("results");
            Map<Long, Sujet> byId = new HashMap<>();
            autres.forEach(s -> byId.put(s.getId(), s));

            List<SimilariteDto> out = new ArrayList<>();
            for (Map<String, Object> r : results) {
                Long id = ((Number) r.get("id")).longValue();
                double sim = ((Number) r.get("score")).doubleValue();
                Sujet s = byId.get(id);
                if (s != null) {
                    out.add(new SimilariteDto(id, s.getTitre(), sim));
                }
            }
            return out;
        } catch (Exception e) {
            log.warn("Service IA indisponible, fallback Jaccard: {}", e.getMessage());
            return fallbackJaccard(cible, autres, topK);
        }
    }

    /** Récupère des suggestions d'idées depuis le service Python */
    public Map<String, Object> getSuggestions(Long sujetId) {
        Sujet sujet = sujetRepo.findById(sujetId).orElse(null);
        if (sujet == null) return Map.of();

        try {
            RestClient client = RestClient.create();
            Map<String, Object> body = Map.of(
                "titre", sujet.getTitre(),
                "description", sujet.getDescription() == null ? "" : sujet.getDescription(),
                "module", sujet.getModule() != null ? sujet.getModule().getNom() : ""
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> resp = client.post()
                .uri(aiUrl + "/suggestions")
                .body(body)
                .retrieve()
                .body(Map.class);

            return resp != null ? resp : Map.of();
        } catch (Exception e) {
            log.warn("Service IA indisponible pour suggestions: {}", e.getMessage());
            return Map.of(
                "ideas", List.of(
                    "Ajouter des tests unitaires",
                    "Documenter l'API avec Swagger",
                    "Mettre en place une CI/CD",
                    "Optimiser les performances"
                ),
                "stack", List.of("Git", "Docker"),
                "keywords", List.of()
            );
        }
    }

    private List<SimilariteDto> fallbackJaccard(Sujet cible, List<Sujet> autres, int topK) {
        Set<String> tokensCible = tokenize(cible.getTitre() + " " + (cible.getDescription() == null ? "" : cible.getDescription()));
        return autres.stream()
            .map(s -> {
                Set<String> tokens = tokenize(s.getTitre() + " " + (s.getDescription() == null ? "" : s.getDescription()));
                Set<String> inter = new HashSet<>(tokensCible);
                inter.retainAll(tokens);
                Set<String> union = new HashSet<>(tokensCible);
                union.addAll(tokens);
                double score = union.isEmpty() ? 0 : (double) inter.size() / union.size();
                return new SimilariteDto(s.getId(), s.getTitre(), score);
            })
            .sorted(Comparator.comparingDouble(SimilariteDto::getSimilarite).reversed())
            .limit(topK)
            .toList();
    }

    private Set<String> tokenize(String s) {
        if (s == null) return Set.of();
        return Arrays.stream(s.toLowerCase().split("[^a-z\u00e0-\u00ff0-9]+"))
            .filter(t -> t.length() > 2)
            .collect(java.util.stream.Collectors.toSet());
    }
}
