package grit.domain.member.withdrawal;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "withdrawal_cleanup", indexes = @Index(name = "idx_withdrawal_cleanup_due", columnList = "next_attempt_at,id"))
public class WithdrawalCleanup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 회원 삭제 후에도 작업이 남아야 하므로 회원 외래 키를 사용하지 않는다.
    @Column(name = "image_name", nullable = false)
    private UUID imageName;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;
    @Column(nullable = false)
    private int attempts;

    public static WithdrawalCleanup create(UUID imageName, Instant now) {
        WithdrawalCleanup task = new WithdrawalCleanup();
        task.imageName = imageName;
        task.createdAt = now;
        task.nextAttemptAt = now;
        return task;
    }

    public void retry(Instant now) {
        attempts++;
        long delaySeconds = Math.min(3600, 5L << Math.min(attempts - 1, 10));
        nextAttemptAt = now.plusSeconds(delaySeconds);
    }
}
