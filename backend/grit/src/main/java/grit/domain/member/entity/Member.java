package grit.domain.member.entity;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.global.entity.BaseEntity;
import grit.global.exception.InvalidInputException;
import grit.global.exception.ProfileAlreadyInitializedException;
import grit.global.exception.ProfileNotInitializedException;
import java.time.LocalDate;
import java.time.LocalTime;
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
@ToString(callSuper = true, exclude = { "memberGroups", "friends" }) // lombok 무한루프 방지용
public class Member extends BaseEntity {

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

    @Column(length = 40)
    private String introduction;

    @Column
    private UUID imageName;

    @Column
    private LocalDate dDayDate;

    @Column
    private String dDayTitle;

    @Column
    private LocalTime weeklyStudyTimeGoal;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.PENDING;

    // group
    @Builder.Default
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<MemberGroup> memberGroups = new ArrayList<>();

    // friend
    @ManyToMany
    @JoinTable(name = "friendship", joinColumns = @JoinColumn(name = "member_id"), inverseJoinColumns = @JoinColumn(name = "friend_id"))
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

    public void initializeProfile(String nickname, String introduction, UUID imageName,
            LocalDate dDayDate, String dDayTitle, LocalTime weeklyStudyTimeGoal) {
        validateRoleForInitialization();

        this.nickname = validateAndGet(nickname, "닉네임");
        this.introduction = requireNotNull(introduction, "자기소개");
        this.imageName = imageName;
        validateDDayConsistency(dDayDate, dDayTitle);
        this.dDayDate = dDayDate;
        this.dDayTitle = dDayTitle;
        this.weeklyStudyTimeGoal = weeklyStudyTimeGoal;
        this.role = Role.USER;
    }

    public void updateProfile(String nickname, String introduction, UUID imageName,
            LocalDate dDayDate, String dDayTitle, LocalTime weeklyStudyTimeGoal) {
        validateRoleForUpdate();

        this.nickname = validateAndGet(nickname, "닉네임");
        this.introduction = introduction;
        this.imageName = imageName;
        validateDDayConsistency(dDayDate, dDayTitle);
        this.dDayDate = dDayDate;
        this.dDayTitle = dDayTitle;
        this.weeklyStudyTimeGoal = weeklyStudyTimeGoal;
    }

    private void validateRoleForInitialization() {
        if (this.role != Role.PENDING) {
            throw new ProfileAlreadyInitializedException("이미 프로필이 초기화된 회원입니다.");
        }
    }

    private void validateRoleForUpdate() {
        if (this.role == Role.PENDING) {
            throw new ProfileNotInitializedException("아직 프로필이 초기화되지 않은 회원입니다.");
        }
    }

    private void validateDDayConsistency(LocalDate dDayDate, String dDayTitle) {
        boolean hasDate = (dDayDate != null);
        boolean hasTitle = (dDayTitle != null && !dDayTitle.isBlank());
        if (hasDate != hasTitle) {
            throw new InvalidInputException("D-Day 날짜와 제목은 함께 제공되거나 함께 비어 있어야 합니다.");
        }
    }

    private String validateAndGet(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidInputException(fieldName + "은(는) 필수이며 공백일 수 없습니다.");
        }
        return value;
    }

    private String requireNotNull(String value, String fieldName) {
        if (value == null) {
            throw new InvalidInputException(fieldName + "은(는) 필수입니다.");
        }
        return value;
    }

}
