package grit.domain.member.withdrawal;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WithdrawalCleanupRepository extends JpaRepository<WithdrawalCleanup, Long> {
    @Query(value = """
            select * from withdrawal_cleanup where next_attempt_at <= :now
            order by next_attempt_at, id limit 1 for update skip locked
            """, nativeQuery = true)
    Optional<WithdrawalCleanup> findNextForUpdate(@Param("now") Instant now);
}
