package com.example.judgingsystem.repository;

import com.example.judgingsystem.model.Criterion;
import com.example.judgingsystem.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CriterionRepository extends JpaRepository<Criterion, Long> {
    List<Criterion> findByEvent(Event event);
}