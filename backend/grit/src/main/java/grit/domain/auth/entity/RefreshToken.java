package grit.domain.auth.entity;

import grit.domain.member.entity.Member;
import jakarta.persistence.*;
import java.time.Duration;
import java.util.UUID;
import lombok.*;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 500, unique = true)
    private String token;

    @Getter
    @Column(nullable = false)
    private LocalDateTime expiresAt;


    public static RefreshToken issue(Member member, Duration duration) {
        String tokenValue = UUID.randomUUID().toString().replace("-", "");
        return RefreshToken.builder()
                .member(member)
                .token(tokenValue)
                .expiresAt(LocalDateTime.now().plus(duration))
                .build();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
