package com.example.judgingsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User judge;
    @ManyToOne
    private Team team;
    private double finalScore;
    private String comment;
    @OneToMany(mappedBy = "score", cascade = CascadeType.ALL)
    private List<ScoreCriterion> scoreCriteria = new ArrayList<>();
}