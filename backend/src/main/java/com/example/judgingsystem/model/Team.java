package com.example.judgingsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String teamName;
    private int teamNumber;
    private String description;
    @ManyToOne
    private Event event;
}