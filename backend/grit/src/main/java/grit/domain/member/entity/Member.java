package grit.domain.member.entity;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import java.time.LocalDateTime;
import java.util.*;

import grit.domain.group.entity.MemberGroup;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "members")
@ToString(exclude = {"memberGroups", "friends"}) // lombok 무한루프 방지용
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(unique = true, length = 10) // 소셜 로그인 닉네임 받기 전일 때 위해서 null 허용
    private String nickname;

    @Column(unique = true, nullable = false, length = 50)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocialProvider provider;

    @Column(nullable = false)
    private String providerId;

    @Setter
    @Column(length = 40)
    private String introduction;

    @Setter
    private String image;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @org.hibernate.annotations.CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinDate;

    // group
    @Builder.Default
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<MemberGroup> memberGroups = new ArrayList<>();

    // friend
    @ManyToMany
    @JoinTable(
        name = "friendship",
        joinColumns = @JoinColumn(name = "member_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    @Builder.Default
    private Set<Member> friends = new HashSet<>();

    public void addFriend(Member member) {
        this.friends.add(member);
        member.getFriends().add(this);
    }

    public void removeFriend(Member member) {
        this.friends.remove(member);
        member.getFriends().remove(this);
    }
}