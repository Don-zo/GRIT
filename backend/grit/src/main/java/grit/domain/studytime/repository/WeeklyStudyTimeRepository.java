package grit.domain.studytime.repository;

import grit.domain.member.entity.Member;
import grit.domain.studytime.entity.WeeklyStudyTime;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WeeklyStudyTimeRepository extends JpaRepository<WeeklyStudyTime, Long> {

    Optional<WeeklyStudyTime> findByMemberAndWeekStartDate(Member member, LocalDate weekStartDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select w from WeeklyStudyTime w
            where w.member = :member and w.weekStartDate = :weekStartDate
            """)
    Optional<WeeklyStudyTime> findByMemberAndWeekStartDateForUpdate(
            @Param("member") Member member,
            @Param("weekStartDate") LocalDate weekStartDate);
}
