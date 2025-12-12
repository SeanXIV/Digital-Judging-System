package com.example.judgingsystem.repository;

import com.example.judgingsystem.model.Score;
import com.example.judgingsystem.model.Team;
import com.example.judgingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByTeam(Team team);
    List<Score> findByJudge(User judge);
}