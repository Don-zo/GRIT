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

    private Instant anchorFocusEndsAt;

    private Instant anchorBreakEndsAt;

    @Min(1)
    @Max(60)
    @Column(nullable = false)
    private int focusMinutes;

    @Min(1)
    @Max(6)
    @Column(nullable = false)
    private int totalRounds;

    public void start(Instant startedAt, int focusMinutes, int totalRounds) {
        this.status = PomodoroStatus.RUNNING;
        this.startedAt = startedAt;
        this.pausedAt = null;
        this.accumulatedPausedSeconds = 0;
        this.focusMinutes = focusMinutes;
        this.totalRounds = totalRounds;
        this.anchorFocusEndsAt = startedAt.plusSeconds(getFocusSeconds());
        this.anchorBreakEndsAt = startedAt.plusSeconds(ROUND_SECONDS);
    }

    public void pause(Instant pauseStartedAt) {
        PomodoroStatus currentStatus = getCurrentStatus(pauseStartedAt);
        if (currentStatus != PomodoroStatus.RUNNING && currentStatus != PomodoroStatus.BREAK) {
            throw new InvalidInputException("일시정지할 수 없는 뽀모도로 상태입니다.");
        }

        pinCurrentRoundBoundaries(pauseStartedAt);
        this.status = PomodoroStatus.PAUSED;
        this.pausedAt = pauseStartedAt;
    }

    public void resume(Instant resumedAt) {
        if (this.status != PomodoroStatus.PAUSED) {
            throw new InvalidInputException("재개할 수 없는 뽀모도로 상태입니다.");
        }

        if (this.pausedAt != null) {
            pinCurrentRoundBoundaries(this.pausedAt);
            long pauseSeconds = Math.max(0, Duration.between(this.pausedAt, resumedAt).getSeconds());
            this.accumulatedPausedSeconds += pauseSeconds;
            delayFutureBoundariesAfter(this.pausedAt, pauseSeconds);
        }
        this.status = PomodoroStatus.RUNNING;
        this.pausedAt = null;
    }

    public void stop() {
        this.status = PomodoroStatus.IDLE;
        this.pausedAt = null;
        this.accumulatedPausedSeconds = 0;
        this.anchorFocusEndsAt = null;
        this.anchorBreakEndsAt = null;
    }

    public PomodoroStatus getCurrentStatus(Instant now) {
        if (status == PomodoroStatus.IDLE || status == PomodoroStatus.PAUSED) {
            return status;
        }

        long elapsedSeconds = getElapsedSecondsAt(now);
        if (elapsedSeconds >= totalRounds * ROUND_SECONDS) {
            return PomodoroStatus.FINISHED;
        }

        return getRoundElapsedSeconds(elapsedSeconds) < getFocusSeconds()
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

        return getRoundElapsedSeconds(getElapsedSecondsAt(now)) < getFocusSeconds()
                ? PomodoroPhase.FOCUS
                : PomodoroPhase.BREAK;
    }

    public int getCurrentRound(Instant now) {
        if (status == PomodoroStatus.IDLE || startedAt == null) {
            return 1;
        }

        long elapsedSeconds = getElapsedSecondsAt(now);
        if (elapsedSeconds >= totalRounds * ROUND_SECONDS) {
            return totalRounds;
        }

        return (int) (elapsedSeconds / ROUND_SECONDS) + 1;
    }

    public int getBreakMinutes() {
        return 60 - focusMinutes;
    }

    public Instant getFocusEndsAt(Instant now) {
        if (isIdleOrFinished(now)) {
            return null;
        }

        return withOngoingPause(getCurrentRoundBoundaries(now).focusEndsAt(), now);
    }

    public Instant getBreakEndsAt(Instant now) {
        if (isIdleOrFinished(now)) {
            return null;
        }

        return withOngoingPause(getCurrentRoundBoundaries(now).breakEndsAt(), now);
    }

    private boolean isIdleOrFinished(Instant now) {
        PomodoroStatus currentStatus = getCurrentStatus(now);
        return currentStatus == PomodoroStatus.IDLE || currentStatus == PomodoroStatus.FINISHED || startedAt == null;
    }

    private long getCurrentPauseSeconds(Instant now) {
        if (status != PomodoroStatus.PAUSED || pausedAt == null) {
            return 0;
        }

        return Math.max(0, Duration.between(pausedAt, now).getSeconds());
    }

    private RoundBoundaries getCurrentRoundBoundaries(Instant now) {
        RoundBoundaries boundaries = getAnchorBoundaries();
        Instant effectiveNow = getEffectiveNow(now);

        for (int round = 1; round < totalRounds && !effectiveNow.isBefore(boundaries.breakEndsAt()); round++) {
            boundaries = boundaries.nextRound(getFocusSeconds());
        }

        return boundaries;
    }

    private RoundBoundaries getAnchorBoundaries() {
        Instant focusEndsAt = anchorFocusEndsAt != null
                ? anchorFocusEndsAt
                : startedAt.plusSeconds(getFocusSeconds());
        Instant breakEndsAt = anchorBreakEndsAt != null
                ? anchorBreakEndsAt
                : startedAt.plusSeconds(ROUND_SECONDS);

        return new RoundBoundaries(focusEndsAt, breakEndsAt);
    }

    private void pinCurrentRoundBoundaries(Instant now) {
        RoundBoundaries boundaries = getCurrentRoundBoundaries(now);
        this.anchorFocusEndsAt = boundaries.focusEndsAt();
        this.anchorBreakEndsAt = boundaries.breakEndsAt();
    }

    private void delayFutureBoundariesAfter(Instant pauseStartedAt, long pauseSeconds) {
        if (pauseSeconds == 0) {
            return;
        }

        if (anchorFocusEndsAt != null && pauseStartedAt.isBefore(anchorFocusEndsAt)) {
            anchorFocusEndsAt = anchorFocusEndsAt.plusSeconds(pauseSeconds);
        }
        if (anchorBreakEndsAt != null && pauseStartedAt.isBefore(anchorBreakEndsAt)) {
            anchorBreakEndsAt = anchorBreakEndsAt.plusSeconds(pauseSeconds);
        }
    }

    private Instant withOngoingPause(Instant boundary, Instant now) {
        if (status == PomodoroStatus.PAUSED && pausedAt != null && pausedAt.isBefore(boundary)) {
            return boundary.plusSeconds(getCurrentPauseSeconds(now));
        }

        return boundary;
    }

    private long getElapsedSecondsAt(Instant now) {
        long rawElapsedSeconds = Math.max(0, Duration.between(startedAt, getEffectiveNow(now)).getSeconds());

        return Math.max(0, rawElapsedSeconds - accumulatedPausedSeconds);
    }

    private Instant getEffectiveNow(Instant now) {
        return status == PomodoroStatus.PAUSED && pausedAt != null ? pausedAt : now;
    }

    private long getRoundElapsedSeconds(long elapsedSeconds) {
        return elapsedSeconds % ROUND_SECONDS;
    }

    private long getFocusSeconds() {
        return focusMinutes * 60L;
    }

    private record RoundBoundaries(
            Instant focusEndsAt,
            Instant breakEndsAt
    ) {

        private RoundBoundaries nextRound(long focusSeconds) {
            Instant nextRoundStartedAt = breakEndsAt;

            return new RoundBoundaries(
                    nextRoundStartedAt.plusSeconds(focusSeconds),
                    nextRoundStartedAt.plusSeconds(ROUND_SECONDS)
            );
        }
    }
}
