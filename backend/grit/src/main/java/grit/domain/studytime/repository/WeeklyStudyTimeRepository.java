package grit.domain.studytime.repository;

import grit.domain.member.entity.Member;
import grit.domain.studytime.entity.WeeklyStudyTime;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WeeklyStudyTimeRepository extends JpaRepository<WeeklyStudyTime, Long> {

    Optional<WeeklyStudyTime> findByMemberAndWeekStartDate(Member member, LocalDate weekStartDate);

    @Modifying
    @Query("delete from WeeklyStudyTime e where e.member.id = :memberId")
    void deleteAllForMember(@Param("memberId") Long memberId);
}
