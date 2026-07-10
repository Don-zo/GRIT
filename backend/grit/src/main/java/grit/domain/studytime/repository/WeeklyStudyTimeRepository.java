package grit.domain.studytime.repository;

import grit.domain.member.entity.Member;
import grit.domain.studytime.entity.WeeklyStudyTime;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyStudyTimeRepository extends JpaRepository<WeeklyStudyTime, Long> {

    Optional<WeeklyStudyTime> findByMemberAndWeekStartDate(Member member, LocalDate weekStartDate);
}
