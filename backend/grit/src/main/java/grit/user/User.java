package grit.user;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@ToString(exclude = "friends") // lombok 무한루프 방지용
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

    // 친구 관련
    @ManyToMany
    @JoinTable(
        name = "friendship",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    @Builder.Default
    private Set<User> friends = new HashSet<>();

    public void addFriend(User user) {
        this.friends.add(user);
        user.getFriends().add(this);
    }

    public void removeFriend(User user) {
        this.friends.remove(user);
        user.getFriends().remove(this);
    }
}