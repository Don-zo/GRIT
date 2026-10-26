package grit.domain.member.withdrawal;

import grit.domain.member.repository.MemberRepository;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import java.time.Clock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalCleanupProcessor {
    private final WithdrawalCleanupRepository repository;
    private final MemberRepository members;
    private final S3Service s3;
    private final Clock clock;

    // 작업 행만 잠근다. 탈퇴 요청의 트랜잭션에서는 외부 API를 호출하지 않는다.
    @Transactional
    public boolean processNext() {
        var next = repository.findNextForUpdate(clock.instant());
        if (next.isEmpty()) {
            return false;
        }
        WithdrawalCleanup task = next.get();
        try {
            // 처리 대기 중 이미지가 다시 사용되었으면 공유 객체를 보존한다.
            if (!members.existsByImageName(task.getImageName())) {
                s3.deleteObject(S3Directory.PROFILE_IMAGES, task.getImageName().toString());
            }
            repository.delete(task);
        } catch (RuntimeException ex) {
            task.retry(clock.instant());
            log.warn("Withdrawal image cleanup failed: taskId={}, attempts={}", task.getId(), task.getAttempts());
        }
        return true;
    }
}
