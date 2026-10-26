package grit.domain.member.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import grit.domain.auth.entity.RefreshToken;
import grit.domain.auth.infrastructure.jwt.JwtProvider;
import grit.domain.auth.repository.RefreshTokenRepository;
import grit.domain.auth.service.TokenService;
import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.entity.MemberGroup;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import grit.domain.member.withdrawal.WithdrawalCleanup;
import grit.domain.member.withdrawal.WithdrawalCleanupRepository;
import grit.domain.member.withdrawal.WithdrawalCleanupProcessor;
import java.time.Clock;
import grit.domain.member.repository.MemberRepository;
import grit.domain.studytime.entity.StudyTimerState;
import grit.domain.studytime.entity.WeeklyStudyTime;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.entity.TodoCategory;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

@SpringJUnitConfig(MemberWithdrawalServiceTest.Config.class)
class MemberWithdrawalServiceTest {
    @Configuration
    @EnableTransactionManagement
    @EnableJpaRepositories("grit.domain")
    @EnableJpaAuditing
    @Import({MemberWithdrawalService.class, MemberService.class, GroupService.class, WithdrawalCleanupProcessor.class})
    static class Config {
        @Bean DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:withdrawal;DB_CLOSE_DELAY=-1;NON_KEYWORDS=GROUPS", "sa", "");
        }
        @Bean LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
            var factory = new LocalContainerEntityManagerFactoryBean();
            factory.setDataSource(dataSource);
            factory.setPackagesToScan("grit.domain");
            factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            factory.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
            return factory;
        }
        @Bean PlatformTransactionManager transactionManager(jakarta.persistence.EntityManagerFactory factory) {
            return new JpaTransactionManager(factory);
        }
        @Bean AuditorAware<Long> auditorAware() { return () -> Optional.of(0L); }
        @Bean S3Service s3Service() { return mock(S3Service.class); }
        @Bean Clock clock() { return mock(Clock.class); }
    }

    @PersistenceContext EntityManager em;
    @Autowired MemberWithdrawalService withdrawal;
    @Autowired MemberService members;
    @Autowired MemberRepository memberRepository;
    @Autowired RefreshTokenRepository refreshTokens;
    @Autowired S3Service s3;
    @Autowired WithdrawalCleanupRepository cleanup;
    @Autowired WithdrawalCleanupProcessor processor;
    @Autowired Clock clock;
    @Autowired PlatformTransactionManager transactionManager;
    TransactionTemplate tx;
    Member departing;
    Long otherId;
    Long soloId;
    Long sharedId;
    UUID image;
    String oldRefreshToken;

    @BeforeEach
    void setUp() {
        reset(s3, clock);
        when(clock.instant()).thenReturn(Instant.parse("2026-10-26T12:00:00Z"));
        tx = new TransactionTemplate(transactionManager);
        image = UUID.randomUUID();
        tx.executeWithoutResult(status -> {
            for (String table : new String[]{"withdrawal_cleanup", "friendship", "refresh_tokens", "todos", "todo_categories",
                    "study_timer_states", "weekly_study_times", "member_groups", "pomodoros", "groups", "members"}) {
                em.createNativeQuery("delete from " + table).executeUpdate();
            }
            departing = member("departing", image);
            Member other = member("other", null);
            otherId = other.getId();
            departing.addFriend(other);
            // 상대방에만 남아 있는 역방향 참조도 제거되어야 한다.
            Member third = member("third", null);
            third.getFriends().add(departing);
            Group solo = group("SOLO01", 1);
            Group shared = group("SHARED", 2);
            soloId = solo.getId();
            sharedId = shared.getId();
            membership(departing, solo);
            membership(departing, shared);
            membership(other, shared);
            for (Member member : new Member[]{departing, other}) {
                TodoCategory category = new TodoCategory();
                category.setOwner(member);
                category.setName("category");
                em.persist(category);
                Todo todo = new Todo();
                todo.setOwner(member);
                todo.setCategory(category);
                todo.setContent("personal todo");
                em.persist(todo);
                em.persist(StudyTimerState.create(member));
                em.persist(WeeklyStudyTime.create(member, LocalDate.of(2026, 10, 26)));
                RefreshToken token = RefreshToken.issue(member, Duration.ofDays(1));
                em.persist(token);
                if (member == departing) {
                    oldRefreshToken = token.getToken();
                }
                em.persist(RefreshToken.issue(member, Duration.ofDays(1)));
            }
        });
    }

    @Test
    void deletesPersonalDataAndRelationshipsAndAllowsFreshSignup() {
        withdrawal.withdraw(departing.getId());
        TokenService tokens = new TokenService(mock(JwtProvider.class), refreshTokens);
        assertThatThrownBy(() -> tokens.refreshAccessToken(oldRefreshToken))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
        tx.executeWithoutResult(status -> {
            assertThat(em.find(Member.class, departing.getId())).isNull();
            assertThat(em.find(Member.class, otherId)).isNotNull();
            for (String table : new String[]{"refresh_tokens", "study_timer_states", "weekly_study_times", "member_groups"}) {
                assertThat(count(table, "member_id", departing.getId())).as(table).isZero();
            }
            for (String table : new String[]{"todos", "todo_categories"}) {
                assertThat(count(table, "owner_id", departing.getId())).as(table).isZero();
                assertThat(count(table, "owner_id", otherId)).as(table).isEqualTo(1);
            }
            assertThat(count("friendship", "friend_id", departing.getId())).isZero();
            assertThat(count("friendship", "member_id", departing.getId())).isZero();
            assertThat(count("refresh_tokens", "member_id", otherId)).isEqualTo(2);
            assertThat(count("weekly_study_times", "member_id", otherId)).isEqualTo(1);
            assertThat(count("study_timer_states", "member_id", otherId)).isEqualTo(1);
            assertThat(em.find(Group.class, soloId)).isNull();
            assertThat(count("pomodoros", "group_id", soloId)).isZero();
            assertThat(em.find(Group.class, sharedId).getMemberCount()).isEqualTo(1);
            assertThat(count("pomodoros", "group_id", sharedId)).isEqualTo(1);
            assertThat(count("member_groups", "member_id", otherId)).isEqualTo(1);
            Member fresh = members.createMember(departing.getEmail(), departing.getProvider(), departing.getProviderId());
            assertThat(fresh.getId()).isNotEqualTo(departing.getId());
            assertThat(fresh.getRole()).isEqualTo(Role.PENDING);
            assertThat(memberRepository.existsByNickname(departing.getNickname())).isFalse();
        });
        verifyNoInteractions(s3);
        assertThat(cleanup.findAll()).singleElement().satisfies(task -> assertThat(task.getImageName()).isEqualTo(image));
        assertThat(processor.processNext()).isTrue();
        verify(s3).deleteObject(S3Directory.PROFILE_IMAGES, image.toString());
        assertThat(cleanup.count()).isZero();
    }

    @Test
    void keepsAnImageStillUsedByAnotherMember() {
        tx.executeWithoutResult(status -> member("sharedimg", image));
        withdrawal.withdraw(departing.getId());
        verifyNoInteractions(s3);
        assertThat(cleanup.count()).isZero();
    }

    @Test
    void imageFailureDoesNotUndoWithdrawalAndRetriesAfterBackoff() {
        withdrawal.withdraw(departing.getId());
        doThrow(new IllegalStateException("S3 unavailable")).when(s3).deleteObject(anyString(), anyString());
        assertThat(processor.processNext()).isTrue();
        assertThat(memberRepository.existsById(departing.getId())).isFalse();
        assertThat(cleanup.findAll()).singleElement().satisfies(task -> {
            assertThat(task.getAttempts()).isEqualTo(1);
            assertThat(task.getNextAttemptAt()).isEqualTo(clock.instant().plusSeconds(5));
        });
        assertThat(processor.processNext()).isFalse();
        reset(s3);
        when(clock.instant()).thenReturn(Instant.parse("2026-10-26T12:00:05Z"));
        assertThat(processor.processNext()).isTrue();
        verify(s3).deleteObject(S3Directory.PROFILE_IMAGES, image.toString());
        assertThat(cleanup.count()).isZero();
    }

    @Test
    void databaseRollbackAlsoRollsBackCleanupTask() {
        tx.executeWithoutResult(status -> {
            withdrawal.withdraw(departing.getId());
            status.setRollbackOnly();
        });
        tx.executeWithoutResult(status -> {
            assertThat(em.find(Member.class, departing.getId())).isNotNull();
            assertThat(count("todos", "owner_id", departing.getId())).isEqualTo(1);
            assertThat(count("refresh_tokens", "member_id", departing.getId())).isEqualTo(2);
            assertThat(count("member_groups", "member_id", departing.getId())).isEqualTo(2);
            assertThat(em.find(Group.class, sharedId).getMemberCount()).isEqualTo(2);
            assertThat(em.find(Group.class, soloId)).isNotNull();
        });
        assertThat(cleanup.count()).isZero();
        verifyNoInteractions(s3);
    }

    @Test
    void workerPreservesAnImageReusedWhileTaskWasPending() {
        withdrawal.withdraw(departing.getId());
        tx.executeWithoutResult(status -> member("reuseimage", image));
        assertThat(processor.processNext()).isTrue();
        verifyNoInteractions(s3);
        assertThat(cleanup.count()).isZero();
    }

    @Test
    void pendingMemberWithNoRelatedDataCanWithdraw() {
        Long pendingId = tx.execute(status -> members.createMember("pending@example.com", SocialProvider.GOOGLE, "pending").getId());
        withdrawal.withdraw(pendingId);
        assertThat(memberRepository.existsById(pendingId)).isFalse();
        verifyNoInteractions(s3);
        assertThat(cleanup.count()).isZero();
    }

    Member member(String name, UUID imageName) {
        Member member = Member.builder().email(name + "@example.com").nickname(name)
                .provider(SocialProvider.GOOGLE).providerId(name).role(Role.USER).imageName(imageName).build();
        em.persist(member);
        return member;
    }
    Group group(String code, int count) {
        Group group = Group.builder().name(code).code(code).memberCount(count).build();
        em.persist(group);
        Pomodoro timer = Pomodoro.builder().group(group).startedAt(Instant.now()).focusMinutes(25).totalRounds(2).build();
        em.persist(timer);
        return group;
    }
    void membership(Member member, Group group) {
        em.persist(MemberGroup.builder().member(member).group(group).build());
    }
    long count(String table, String column, Long id) {
        return ((Number) em.createNativeQuery("select count(*) from " + table + " where " + column + " = :id")
                .setParameter("id", id).getSingleResult()).longValue();
    }
}
