package grit.domain.studytime.entity;

import grit.domain.group.entity.Group;
import grit.domain.member.entity.Member;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(
        name = "study_timer_states",
        uniqueConstraints = @UniqueConstraint(name = "uk_study_timer_state_member", columnNames = "member_id")
)
public class StudyTimerState extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Builder.Default
    @Column(nullable = false)
    private boolean running = false;

    private Instant lastStartedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_group_id")
    private Group activeGroup;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StudyTimerStartSource startSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manual_paused_group_id")
    private Group manualPausedGroup;

    @Column(length = 80)
    private String manualPausedPomodoroPhaseKey;

    public static StudyTimerState create(Member member) {
        return StudyTimerState.builder()
                .member(member)
                .build();
    }

    public void start(Group group, Instant startedAt, StudyTimerStartSource startSource) {
        if (running) {
            return;
        }

        this.running = true;
        this.lastStartedAt = startedAt;
        this.activeGroup = group;
        this.startSource = startSource;
    }

    public Instant pause() {
        if (!running) {
            return null;
        }

        Instant startedAt = this.lastStartedAt;
        this.running = false;
        this.lastStartedAt = null;
        this.activeGroup = null;
        this.startSource = null;
        return startedAt;
    }

    public boolean isRunningIn(Group group) {
        return running
                && activeGroup != null
                && activeGroup.getId() != null
                && activeGroup.getId().equals(group.getId());
    }

    public boolean hasManualPauseFor(Group group, String phaseKey) {
        return manualPausedGroup != null
                && manualPausedGroup.getId() != null
                && manualPausedGroup.getId().equals(group.getId())
                && manualPausedPomodoroPhaseKey != null
                && manualPausedPomodoroPhaseKey.equals(phaseKey);
    }

    public boolean isAutoStarted() {
        return startSource == null || startSource == StudyTimerStartSource.AUTO;
    }

    public void markManualPaused(Group group, String phaseKey) {
        this.manualPausedGroup = group;
        this.manualPausedPomodoroPhaseKey = phaseKey;
    }

    public void clearManualPaused() {
        this.manualPausedGroup = null;
        this.manualPausedPomodoroPhaseKey = null;
    }
}
