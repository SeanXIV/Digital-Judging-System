package com.example.judgingsystem.controller;

import com.example.judgingsystem.model.*;
import com.example.judgingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/judge")
@PreAuthorize("hasRole('JUDGE')")
public class JudgeController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private CriterionRepository criterionRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping("/teams")
    public List<Team> getTeamsToScore() {
        User judge = getCurrentUser();
        Event event = judge.getEvent();
        List<Team> allTeams = teamRepository.findByEvent(event);
        return allTeams.stream()
                .filter(team -> scoreRepository.findByTeam(team).stream()
                        .noneMatch(score -> score.getJudge().equals(judge)))
                .collect(Collectors.toList());
    }

    @GetMapping("/scored-teams")
    public List<Map<String, Object>> getScoredTeams() {
        User judge = getCurrentUser();
        List<Score> scores = scoreRepository.findByJudge(judge);
        return scores.stream().map(score -> {
            Map<String, Object> scoreData = new java.util.HashMap<>();
            scoreData.put("team", score.getTeam());
            scoreData.put("score", score.getFinalScore());
            scoreData.put("comment", score.getComment());

            // Add individual criterion scores
            Map<String, Object> criteria = new java.util.HashMap<>();
            for (ScoreCriterion sc : score.getScoreCriteria()) {
                criteria.put(sc.getCriterion().getName(), sc.getValue());
            }
            scoreData.put("criteria", criteria);
            scoreData.put("timestamp", score.getId()); // Use ID as timestamp proxy
            return scoreData;
        }).collect(Collectors.toList());
    }

    @PostMapping("/teams/{teamId}/score")
    public Score submitScore(@PathVariable Long teamId, @RequestBody Map<String, Object> data) {
        User judge = getCurrentUser();
        Team team = teamRepository.findById(teamId).orElseThrow();
        Event event = team.getEvent();

        if (judge.getEvent() == null || !judge.getEvent().equals(event)) {
            throw new RuntimeException("Judge not assigned to this team's event");
        }

        // Check if already scored
        boolean alreadyScored = scoreRepository.findByTeam(team).stream()
                .anyMatch(score -> score.getJudge().equals(judge));
        if (alreadyScored) {
            throw new RuntimeException("Already scored this team");
        }

        String comment = (String) data.get("comment");

        Score score = new Score();
        score.setJudge(judge);
        score.setTeam(team);
        score.setComment(comment);

        List<Criterion> criteria = criterionRepository.findByEvent(event);
        double finalScore = 0.0;
        for (Criterion criterion : criteria) {
            int value = ((Number) data.getOrDefault(criterion.getName(), 0)).intValue();
            ScoreCriterion sc = new ScoreCriterion();
            sc.setScore(score);
            sc.setCriterion(criterion);
            sc.setValue(value);
            score.getScoreCriteria().add(sc);
            finalScore += value * criterion.getWeight();
        }
        score.setFinalScore(finalScore);

        return scoreRepository.save(score);
    }
}