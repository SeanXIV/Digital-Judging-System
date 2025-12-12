package com.example.judgingsystem.controller;

import com.example.judgingsystem.model.*;
import com.example.judgingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/organizer")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private CriterionRepository criterionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping("/events")
    public Event createEvent(@RequestBody Event event) {
        User organizer = getCurrentUser();
        event.setOrganizer(organizer);
        // Set the event reference on each criterion
        if (event.getCriteria() != null) {
            for (Criterion criterion : event.getCriteria()) {
                criterion.setEvent(event);
            }
        }
        return eventRepository.save(event);
    }

    @GetMapping("/events")
    public List<Map<String, Object>> getEvents() {
        User organizer = getCurrentUser();
        return eventRepository.findByOrganizer(organizer).stream().map(event -> {
            Map<String, Object> eventData = new java.util.HashMap<>();
            eventData.put("id", event.getId());
            eventData.put("name", event.getName());
            eventData.put("date", event.getDate());
            eventData.put("teamCount", teamRepository.findByEvent(event).size());
            eventData.put("judgeCount", userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.JUDGE && u.getEvent() != null && u.getEvent().getId().equals(event.getId()))
                    .count());
            return eventData;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        User organizer = getCurrentUser();
        if (!event.getOrganizer().equals(organizer)) {
            return ResponseEntity.status(403).body("Not authorized to delete this event");
        }
        // Delete scores for teams in this event
        List<Team> teams = teamRepository.findByEvent(event);
        for (Team team : teams) {
            scoreRepository.deleteAll(scoreRepository.findByTeam(team));
        }
        // Clear event reference from judges
        List<User> judges = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JUDGE && u.getEvent() != null && u.getEvent().getId().equals(eventId))
                .collect(Collectors.toList());
        for (User judge : judges) {
            judge.setEvent(null);
            userRepository.save(judge);
        }
        eventRepository.delete(event);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @PostMapping("/events/{eventId}/teams")
    public Team addTeam(@PathVariable Long eventId, @RequestBody Team team) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        // Check for duplicate team name and description
        boolean exists = teamRepository.findByEvent(event).stream()
                .anyMatch(t -> t.getTeamName().equals(team.getTeamName()) && t.getDescription().equals(team.getDescription()));
        if (exists) {
            throw new RuntimeException("Team with this name or number already exists in the event");
        }
        team.setEvent(event);
        return teamRepository.save(team);
    }

    @GetMapping("/events/{eventId}/teams")
    public List<Team> getTeams(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return teamRepository.findByEvent(event);
    }

    @PostMapping("/events/{eventId}/judges")
    public User addJudge(@PathVariable Long eventId, @RequestBody Map<String, String> judgeData) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        String email = judgeData.get("email");
        User judge = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(judgeData.getOrDefault("name", email.split("@")[0]));
            newUser.setPassword(passwordEncoder.encode("password123"));
            newUser.setRole(Role.JUDGE);
            return userRepository.save(newUser);
        });
        if (judge.getRole() != Role.JUDGE) {
            judge.setRole(Role.JUDGE);
            judge = userRepository.save(judge);
        }
        judge.setEvent(event);
        return userRepository.save(judge);
    }

    @GetMapping("/events/{eventId}/judges")
    public List<User> getJudges(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JUDGE && u.getEvent() != null && u.getEvent().getId().equals(eventId))
                .collect(Collectors.toList());
    }

    @GetMapping("/events/{eventId}/leaderboard")
    public List<Map<String, Object>> getLeaderboard(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Team> teams = teamRepository.findByEvent(event);
        return teams.stream().map(team -> {
            List<Score> scores = scoreRepository.findByTeam(team);
            double average = scores.stream().mapToDouble(Score::getFinalScore).average().orElse(0.0);
            return Map.of("team", team, "averageScore", average);
        }).sorted((a, b) -> Double.compare((Double) b.get("averageScore"), (Double) a.get("averageScore")))
                .collect(Collectors.toList());
    }

    @GetMapping("/events/{eventId}/detailed-scores")
    public Map<String, Object> getDetailedScores(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Team> teams = teamRepository.findByEvent(event);
        List<User> judges = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JUDGE && u.getEvent() != null && u.getEvent().getId().equals(eventId))
                .collect(Collectors.toList());
        List<Criterion> criteria = criterionRepository.findByEvent(event);

        // Create a matrix of team x judge scores
        List<Map<String, Object>> teamScores = teams.stream().map(team -> {
            Map<String, Object> teamData = new java.util.HashMap<>();
            teamData.put("team", team);

            // For each judge, find their score for this team
            Map<String, Object> judgeScores = new java.util.HashMap<>();
            for (User judge : judges) {
                Score score = scoreRepository.findByTeam(team).stream()
                        .filter(s -> s.getJudge().equals(judge))
                        .findFirst().orElse(null);

                if (score != null) {
                    Map<String, Object> scoreDetails = new java.util.HashMap<>();
                    scoreDetails.put("finalScore", score.getFinalScore());
                    scoreDetails.put("comment", score.getComment());

                    // Add individual criterion scores
                    Map<String, Object> criterionScores = new java.util.HashMap<>();
                    for (ScoreCriterion sc : score.getScoreCriteria()) {
                        criterionScores.put(sc.getCriterion().getName(), sc.getValue());
                    }
                    scoreDetails.put("criteria", criterionScores);
                    judgeScores.put(judge.getName(), scoreDetails);
                } else {
                    judgeScores.put(judge.getName(), null); // Not scored yet
                }
            }
            teamData.put("judgeScores", judgeScores);

            // Calculate average score
            List<Double> finalScores = judgeScores.values().stream()
                    .filter(score -> score != null)
                    .map(score -> (Double) ((Map<String, Object>) score).get("finalScore"))
                    .collect(Collectors.toList());
            double average = finalScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            teamData.put("averageScore", average);
            teamData.put("scoresCount", finalScores.size());

            return teamData;
        }).sorted((a, b) -> Double.compare((Double) b.get("averageScore"), (Double) a.get("averageScore")))
                .collect(Collectors.toList());

        return Map.of(
                "teams", teamScores,
                "judges", judges,
                "criteria", criteria,
                "event", event
        );
    }

    @GetMapping("/events/{eventId}/export")
    public ResponseEntity<String> exportLeaderboard(@PathVariable Long eventId) {
        List<Map<String, Object>> leaderboard = getLeaderboard(eventId);
        StringBuilder csv = new StringBuilder("Team Name,Average Score\n");
        for (Map<String, Object> entry : leaderboard) {
            Team team = (Team) entry.get("team");
            double score = (Double) entry.get("averageScore");
            csv.append(team.getTeamName()).append(",").append(score).append("\n");
        }
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=leaderboard.csv")
                .body(csv.toString());
    }

    @PostMapping("/events/{eventId}/teams/upload")
    public ResponseEntity<String> uploadTeams(@PathVariable Long eventId, @RequestParam("file") MultipartFile file) {
        try {
            Event event = eventRepository.findById(eventId).orElseThrow();
            String content = new String(file.getBytes());
            String[] lines = content.split("\\r?\\n");
            int count = 0;
            for (int i = 1; i < lines.length; i++) { // skip header
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(",");
                if (parts.length >= 3) {
                    Team team = new Team();
                    team.setTeamName(parts[0].trim());
                    team.setTeamNumber(Integer.parseInt(parts[1].trim()));
                    team.setDescription(parts[2].trim());
                    team.setEvent(event);
                    teamRepository.save(team);
                    count++;
                }
            }
            return ResponseEntity.ok(count + " teams uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error uploading teams: " + e.getMessage());
        }
    }
}