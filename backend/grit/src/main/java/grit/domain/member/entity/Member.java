package grit.domain.member.entity;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.global.exception.ProfileAlreadyInitializedException;
import java.time.LocalDateTime;
import java.util.*;

import grit.domain.group.entity.MemberGroup;
import jakarta.persistence.*;
import java.util.function.Consumer;
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
    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.PENDING;

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

    public void initializeProfile(String nickname, String introduction, String image) {
        validateRoleForInitialization();

        this.nickname = validateAndGet(nickname, "닉네임");
        this.introduction = validateAndGet(introduction, "자기소개");
        this.image = validateAndGet(image, "이미지");
        this.role = Role.USER;
    }

    public void updateProfile(String nickname, String introduction, String image) {
        updateIfPresent(nickname, val -> this.nickname = val, "닉네임");
        updateIfPresent(introduction, val -> this.introduction = val, "자기소개");
        updateIfPresent(image, val -> this.image = val, "이미지");
    }


    private void validateRoleForInitialization() {
        if (this.role != Role.PENDING) {
            throw new ProfileAlreadyInitializedException("이미 프로필이 초기화된 회원입니다.");
        }
    }

    private String validateAndGet(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + "은(는) 필수이며 공백일 수 없습니다.");
        }
        return value;
    }

    private void updateIfPresent(String value, Consumer<String> setter, String fieldName) {
        if (value != null) {
            setter.accept(validateAndGet(value, fieldName));
        }
    }

}