package grit.domain.group.livekit.pomodoro.repository;

import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PomodoroRepository extends JpaRepository<Pomodoro, Long> {

    Optional<Pomodoro> findByGroup(Group group);
}
