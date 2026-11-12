package grit.domain.auth.repository;

import static org.assertj.core.api.Assertions.assertThat;

import grit.domain.auth.entity.RefreshToken;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.time.Duration;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
@Transactional
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    void deletesWithOneStatementAndTreatsRepeatedDeletionAsSuccess() {
        Member member = Member.builder()
                .email("logout-test@example.com")
                .provider(SocialProvider.GOOGLE)
                .providerId("logout-test")
                .build();
        entityManager.persist(member);
        RefreshToken token = RefreshToken.issue(member, Duration.ofDays(1));
        RefreshToken otherToken = RefreshToken.issue(member, Duration.ofDays(1));
        entityManager.persist(token);
        entityManager.persist(otherToken);
        entityManager.flush();
        entityManager.clear();

        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();

        assertThat(refreshTokenRepository.deleteByToken(token.getToken())).isEqualTo(1);
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(1);
        assertThat(refreshTokenRepository.deleteByToken(token.getToken())).isZero();
        entityManager.flush();
        assertThat(refreshTokenRepository.findByToken(token.getToken())).isEmpty();
        assertThat(refreshTokenRepository.findByToken(otherToken.getToken())).isPresent();
    }
}
