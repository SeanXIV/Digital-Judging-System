package com.example.judgingsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ScoreCriterion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Score score;
    @ManyToOne
    private Criterion criterion;
    private int value;
}