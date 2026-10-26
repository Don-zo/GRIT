package grit.domain.member.withdrawal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class WithdrawalCleanupScheduler {
    private final WithdrawalCleanupProcessor processor;

    @Scheduled(fixedDelayString = "${app.withdrawal.cleanup-delay-ms:5000}")
    public void cleanUp() {
        try {
            for (int i = 0; i < 20 && processor.processNext(); i++) {
                // 각 작업을 별도 트랜잭션으로 처리한다. 실패한 작업은 backoff 후 재시도한다.
            }
        } catch (RuntimeException ex) {
            log.error("Withdrawal cleanup scheduler failed", ex);
        }
    }
}
