package grit.domain.group.livekit.pomodoro.entity;

import grit.domain.group.entity.Group;
import grit.global.entity.BaseEntity;
import grit.global.exception.InvalidInputException;
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
import java.time.Duration;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pomodoros")
public class Pomodoro extends BaseEntity {

    private static final long ROUND_SECONDS = 60 * 60L;

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
    private Instant startedAt;

    private Instant pausedAt;

    @Column(nullable = false)
    private long accumulatedPausedSeconds;

    @Min(1)
    @Max(60)
    @Column(nullable = false)
    private int focusMinutes;

    @Min(1)
    @Max(6)
    @Column(nullable = false)
    private int totalRounds;

    @Version
    private Long version;

    public void start(Instant startedAt, int focusMinutes, int totalRounds) {
        this.status = PomodoroStatus.RUNNING;
        this.startedAt = startedAt;
        this.pausedAt = null;
        this.accumulatedPausedSeconds = 0;
        this.focusMinutes = focusMinutes;
        this.totalRounds = totalRounds;
    }

    public void pause(Instant pausedAt) {
        PomodoroStatus currentStatus = getCurrentStatus(pausedAt);
        if (currentStatus != PomodoroStatus.RUNNING && currentStatus != PomodoroStatus.BREAK) {
            throw new InvalidInputException("일시정지할 수 없는 뽀모도로 상태입니다.");
        }

        this.status = PomodoroStatus.PAUSED;
        this.pausedAt = pausedAt;
    }

    public void resume(Instant resumedAt) {
        if (this.status != PomodoroStatus.PAUSED) {
            throw new InvalidInputException("재개할 수 없는 뽀모도로 상태입니다.");
        }

        if (this.pausedAt != null) {
            this.accumulatedPausedSeconds += Math.max(0, Duration.between(this.pausedAt, resumedAt).getSeconds());
        }
        this.status = PomodoroStatus.RUNNING;
        this.pausedAt = null;
    }

    public void stop() {
        this.status = PomodoroStatus.IDLE;
        this.pausedAt = null;
        this.accumulatedPausedSeconds = 0;
    }

    public PomodoroStatus getCurrentStatus(Instant now) {
        if (status == PomodoroStatus.IDLE || status == PomodoroStatus.PAUSED) {
            return status;
        }

        long elapsedSeconds = getElapsedSeconds(now);
        if (elapsedSeconds >= totalRounds * ROUND_SECONDS) {
            return PomodoroStatus.FINISHED;
        }

        return getRoundElapsedSeconds(elapsedSeconds) < focusMinutes * 60L
                ? PomodoroStatus.RUNNING
                : PomodoroStatus.BREAK;
    }

    public PomodoroPhase getCurrentPhase(Instant now) {
        if (status == PomodoroStatus.IDLE || startedAt == null) {
            return null;
        }

        PomodoroStatus currentStatus = getCurrentStatus(now);
        if (currentStatus == PomodoroStatus.IDLE || currentStatus == PomodoroStatus.FINISHED) {
            return null;
        }

        return getRoundElapsedSeconds(getElapsedSeconds(now)) < focusMinutes * 60L
                ? PomodoroPhase.FOCUS
                : PomodoroPhase.BREAK;
    }

    public int getCurrentRound(Instant now) {
        if (status == PomodoroStatus.IDLE || startedAt == null) {
            return 1;
        }

        long elapsedSeconds = getElapsedSeconds(now);
        if (elapsedSeconds >= totalRounds * ROUND_SECONDS) {
            return totalRounds;
        }

        return (int) (elapsedSeconds / ROUND_SECONDS) + 1;
    }

    public int getBreakMinutes() {
        return 60 - focusMinutes;
    }

    public Instant getPhaseStartedAt(Instant now) {
        if (isIdleOrFinished(now)) {
            return null;
        }

        return toActualTime(getPhaseStartElapsedSeconds(now));
    }

    public Instant getPhaseEndsAt(Instant now) {
        if (isIdleOrFinished(now)) {
            return null;
        }

        return toActualTime(getPhaseEndElapsedSeconds(now)).plusSeconds(getCurrentPauseSeconds(now));
    }

    private boolean isIdleOrFinished(Instant now) {
        PomodoroStatus currentStatus = getCurrentStatus(now);
        return currentStatus == PomodoroStatus.IDLE || currentStatus == PomodoroStatus.FINISHED || startedAt == null;
    }

    private long getPhaseStartElapsedSeconds(Instant now) {
        long elapsedSeconds = getElapsedSeconds(now);
        long roundElapsedSeconds = getRoundElapsedSeconds(elapsedSeconds);
        long focusSeconds = focusMinutes * 60L;
        long roundStartSeconds = elapsedSeconds - roundElapsedSeconds;

        return roundElapsedSeconds < focusSeconds
                ? roundStartSeconds
                : roundStartSeconds + focusSeconds;
    }

    private long getPhaseEndElapsedSeconds(Instant now) {
        long elapsedSeconds = getElapsedSeconds(now);
        long roundElapsedSeconds = getRoundElapsedSeconds(elapsedSeconds);
        long focusSeconds = focusMinutes * 60L;
        long roundStartSeconds = elapsedSeconds - roundElapsedSeconds;

        return roundElapsedSeconds < focusSeconds
                ? roundStartSeconds + focusSeconds
                : roundStartSeconds + ROUND_SECONDS;
    }

    private Instant toActualTime(long elapsedSeconds) {
        return startedAt.plusSeconds(accumulatedPausedSeconds + elapsedSeconds);
    }

    private long getCurrentPauseSeconds(Instant now) {
        if (status != PomodoroStatus.PAUSED || pausedAt == null) {
            return 0;
        }

        return Math.max(0, Duration.between(pausedAt, now).getSeconds());
    }

    private long getElapsedSeconds(Instant now) {
        Instant effectiveNow = status == PomodoroStatus.PAUSED && pausedAt != null ? pausedAt : now;
        long rawElapsedSeconds = Math.max(0, Duration.between(startedAt, effectiveNow).getSeconds());

        return Math.max(0, rawElapsedSeconds - accumulatedPausedSeconds);
    }

    private long getRoundElapsedSeconds(long elapsedSeconds) {
        return elapsedSeconds % ROUND_SECONDS;
    }
}
