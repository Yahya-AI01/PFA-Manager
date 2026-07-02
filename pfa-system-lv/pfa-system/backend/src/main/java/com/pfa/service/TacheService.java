package com.pfa.service;

import com.pfa.dto.TacheDto;
import com.pfa.entity.Projet;
import com.pfa.entity.StatutTache;
import com.pfa.entity.Tache;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.ProjetRepository;
import com.pfa.repository.TacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TacheService {

    private final TacheRepository tacheRepo;
    private final ProjetRepository projetRepo;

    @Transactional(readOnly = true)
    public List<TacheDto> getByProjet(Long projetId) {
        return tacheRepo.findByProjetIdOrderByDateCreationAsc(projetId)
            .stream().map(this::toDto).toList();
    }

    @Transactional
    public TacheDto creer(Long projetId, TacheDto dto) {
        Projet projet = projetRepo.findById(projetId)
            .orElseThrow(() -> new NotFoundException("Projet introuvable"));
        Tache t = Tache.builder()
            .titre(dto.getTitre())
            .description(dto.getDescription())
            .statut(dto.getStatut() != null ? dto.getStatut() : StatutTache.TODO)
            .projet(projet)
            .build();
        return toDto(tacheRepo.save(t));
    }

    @Transactional
    public TacheDto modifier(Long id, TacheDto dto) {
        Tache t = tacheRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("T\u00e2che introuvable"));
        if (dto.getTitre() != null) t.setTitre(dto.getTitre());
        if (dto.getDescription() != null) t.setDescription(dto.getDescription());
        if (dto.getStatut() != null) t.setStatut(dto.getStatut());
        return toDto(t);
    }

    @Transactional
    public void supprimer(Long id) {
        if (!tacheRepo.existsById(id)) {
            throw new NotFoundException("T\u00e2che introuvable");
        }
        tacheRepo.deleteById(id);
    }

    public TacheDto toDto(Tache t) {
        TacheDto dto = new TacheDto();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setStatut(t.getStatut());
        dto.setProjetId(t.getProjet().getId());
        return dto;
    }
}
