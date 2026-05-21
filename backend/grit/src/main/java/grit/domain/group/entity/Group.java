package grit.domain.group.entity;

import grit.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "groups", indexes = {
        @Index(name = "idx_group_code", columnList = "code")
})
public class Group extends BaseEntity {

    public static final int MAX_MEMBER_COUNT = 6;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 6)
    private String code;

    @Builder.Default
    @Column(nullable = false)
    private int memberCount = 0;

    private UUID imageName;

    @Builder.Default
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<MemberGroup> memberGroups = new ArrayList<>();

    public void increaseMemberCount() {
        this.memberCount++;
    }

    public boolean isFull() {
        return this.memberCount >= MAX_MEMBER_COUNT;
    }

    public void decreaseMemberCount() {
        this.memberCount--;
    }

    public void updateInfo(String name, UUID imageName) {
        if (name != null) {
            this.name = name;
        }
        if (imageName != null) {
            this.imageName = imageName;
        }
    }
}
