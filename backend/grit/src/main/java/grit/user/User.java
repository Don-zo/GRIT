package grit.user;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(unique = true, nullable = false, length = 10)
    private String nickname;

    @Column(unique = true, nullable = false, length = 40)
    private String email;

    @Setter
    @Column(nullable = false)
    private String password;

    @Setter
    @Column(length = 40)
    private String introduction;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @org.hibernate.annotations.CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinDate;
}