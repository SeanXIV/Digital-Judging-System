package com.example.judgingsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Criterion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double weight;
    @ManyToOne
    @JsonIgnoreProperties({"criteria", "teams", "judges"}) // Prevent circular reference
    private Event event;
}