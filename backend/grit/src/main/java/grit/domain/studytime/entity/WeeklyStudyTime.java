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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
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
        name = "weekly_study_times",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_weekly_study_time_member_week",
                columnNames = {"member_id", "week_start_date"}
        )
)
public class WeeklyStudyTime extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Builder.Default
    @Column(nullable = false)
    private long accumulatedSeconds = 0;

    public static WeeklyStudyTime create(Member member, LocalDate weekStartDate) {
        return WeeklyStudyTime.builder()
                .member(member)
                .weekStartDate(weekStartDate)
                .build();
    }

    public void addSeconds(long seconds) {
        if (seconds <= 0) {
            return;
        }

        this.accumulatedSeconds += seconds;
    }
}
