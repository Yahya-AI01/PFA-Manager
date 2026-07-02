package com.pfa.service;

import com.pfa.dto.SujetDto;
import com.pfa.entity.Module;
import com.pfa.entity.Sujet;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.ModuleRepository;
import com.pfa.repository.SujetRepository;
import com.pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SujetService {

    private final SujetRepository sujetRepo;
    private final ModuleRepository moduleRepo;
    private final UtilisateurRepository utilisateurRepo;

    @Transactional(readOnly = true)
    public List<SujetDto> rechercher(String keyword, Long professeurId, Integer annee) {
        return sujetRepo.rechercher(
                (keyword != null && keyword.isBlank()) ? null : keyword,
                professeurId, annee)
            .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SujetDto getById(Long id) {
        return toDto(sujetRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Sujet introuvable")));
    }

    @Transactional
    public SujetDto creer(SujetDto dto, String professeurEmail) {
        Utilisateur prof = utilisateurRepo.findByEmail(professeurEmail)
            .orElseThrow(() -> new NotFoundException("Professeur introuvable"));
        Module module = (dto.getModuleId() != null)
            ? moduleRepo.findById(dto.getModuleId()).orElse(null) : null;

        Sujet s = Sujet.builder()
            .titre(dto.getTitre())
            .description(dto.getDescription())
            .annee(dto.getAnnee())
            .disponible(dto.getDisponible() == null ? true : dto.getDisponible())
            .module(module)
            .professeur(prof)
            .build();
        return toDto(sujetRepo.save(s));
    }

    @Transactional
    public SujetDto modifier(Long id, SujetDto dto, String professeurEmail) {
        Sujet s = sujetRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Sujet introuvable"));
        if (!s.getProfesseur().getEmail().equals(professeurEmail)) {
            throw new NotFoundException("Vous ne pouvez modifier que vos propres sujets");
        }
        s.setTitre(dto.getTitre());
        s.setDescription(dto.getDescription());
        s.setAnnee(dto.getAnnee());
        if (dto.getDisponible() != null) s.setDisponible(dto.getDisponible());
        if (dto.getModuleId() != null) {
            s.setModule(moduleRepo.findById(dto.getModuleId()).orElse(null));
        }
        return toDto(s);
    }

    @Transactional
    public void supprimer(Long id, String professeurEmail) {
        Sujet s = sujetRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Sujet introuvable"));
        if (!s.getProfesseur().getEmail().equals(professeurEmail)) {
            throw new NotFoundException("Vous ne pouvez supprimer que vos propres sujets");
        }
        sujetRepo.delete(s);
    }

    public SujetDto toDto(Sujet s) {
        SujetDto dto = new SujetDto();
        dto.setId(s.getId());
        dto.setTitre(s.getTitre());
        dto.setDescription(s.getDescription());
        dto.setAnnee(s.getAnnee());
        dto.setDisponible(s.getDisponible());
        if (s.getModule() != null) {
            dto.setModuleId(s.getModule().getId());
            dto.setModuleNom(s.getModule().getNom());
        }
        if (s.getProfesseur() != null) {
            dto.setProfesseurId(s.getProfesseur().getId());
            dto.setProfesseurNom(s.getProfesseur().getPrenom() + " " + s.getProfesseur().getNom());
        }
        return dto;
    }
}
