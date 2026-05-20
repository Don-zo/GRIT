package grit.domain.group.livekit.pomodoro.entity;

import grit.domain.group.entity.Group;
import grit.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pomodoros")
public class Pomodoro extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, unique = true)
    private Group group;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PomodoroStatus status = PomodoroStatus.IDLE;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Min(1)
    @Max(60)
    @Column(nullable = false)
    private int focusMinutes;

    @Min(1)
    @Max(6)
    @Column(nullable = false)
    private int totalRounds;

    @Min(1)
    @Max(6)
    @Column(nullable = false)
    private int currentRound;

    @Version
    private Long version;
}
