package com.pfa.repository;

import com.pfa.entity.Tache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByProjetIdOrderByDateCreationAsc(Long projetId);
}
