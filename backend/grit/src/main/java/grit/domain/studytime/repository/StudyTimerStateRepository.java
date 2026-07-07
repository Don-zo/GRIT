package grit.domain.studytime.repository;

import grit.domain.group.entity.Group;
import grit.domain.member.entity.Member;
import grit.domain.studytime.entity.StudyTimerState;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudyTimerStateRepository extends JpaRepository<StudyTimerState, Long> {

    Optional<StudyTimerState> findByMember(Member member);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudyTimerState s where s.member = :member")
    Optional<StudyTimerState> findByMemberForUpdate(@Param("member") Member member);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudyTimerState s where s.activeGroup = :group and s.running = true")
    List<StudyTimerState> findRunningByActiveGroupForUpdate(@Param("group") Group group);
}
