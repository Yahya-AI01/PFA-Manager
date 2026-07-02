package com.pfa.service;

import com.pfa.dto.MessageDto;
import com.pfa.entity.Message;
import com.pfa.entity.Projet;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.MessageRepository;
import com.pfa.repository.ProjetRepository;
import com.pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepo;
    private final ProjetRepository projetRepo;
    private final UtilisateurRepository userRepo;

    @Transactional
    public MessageDto envoyer(Long projetId, String contenu, String userEmail) {
        Projet projet = projetRepo.findById(projetId)
            .orElseThrow(() -> new NotFoundException("Projet introuvable"));
        Utilisateur exp = userRepo.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        Message m = Message.builder()
            .contenu(contenu)
            .expediteur(exp)
            .projet(projet)
            .lu(false)
            .build();
        return toDto(messageRepo.save(m));
    }

    @Transactional
    public List<MessageDto> listerEtMarquerLus(Long projetId, String userEmail) {
        Utilisateur user = userRepo.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        List<Message> messages = messageRepo.findByProjetIdOrderByDateEnvoiAsc(projetId);
        messages.stream()
            .filter(m -> !m.getExpediteur().getId().equals(user.getId()) && !m.getLu())
            .forEach(m -> m.setLu(true));
        return messages.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public long compterNonLus(Long projetId, String userEmail) {
        Utilisateur user = userRepo.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return messageRepo.countNonLusPourUtilisateur(projetId, user.getId());
    }

    public MessageDto toDto(Message m) {
        MessageDto dto = new MessageDto();
        dto.setId(m.getId());
        dto.setContenu(m.getContenu());
        dto.setProjetId(m.getProjet().getId());
        dto.setExpediteurId(m.getExpediteur().getId());
        dto.setExpediteurNom(m.getExpediteur().getNom());
        dto.setExpediteurPrenom(m.getExpediteur().getPrenom());
        dto.setExpediteurRole(m.getExpediteur().getRole().name());
        dto.setLu(m.getLu());
        dto.setDateEnvoi(m.getDateEnvoi());
        return dto;
    }
}
