package grit.group.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_groups", indexes = {
        @Index(name = "idx_invite_code", columnList = "inviteCode")
})
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 6)
    private String inviteCode;

    @Builder.Default
    @Column(nullable = false)
    private int memberCount = 0;

    private String imageUrl;

    @Builder.Default
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<UserGroup> userGroups = new ArrayList<>();

    public void increaseMemberCount() {
        this.memberCount++;
    }

    public void decreaseMemberCount() {
        this.memberCount--;
    }

    public void updateInfo(String name, String imageUrl) {
        if (name != null) this.name = name;
        if (imageUrl != null) this.imageUrl = imageUrl;
    }
}
