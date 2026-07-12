package grit.domain.studytime.entity;

import grit.domain.member.entity.Member;
import grit.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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

    public static StudyTimerState create(Member member) {
        return StudyTimerState.builder()
                .member(member)
                .build();
    }

    public void start(Instant startedAt) {
        if (running) {
            return;
        }

        this.running = true;
        this.lastStartedAt = startedAt;
    }

    public Instant pause() {
        if (!running) {
            return null;
        }

        Instant startedAt = this.lastStartedAt;
        this.running = false;
        this.lastStartedAt = null;
        return startedAt;
    }
}
