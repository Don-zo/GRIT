package grit.todolist.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DailyAchievementDTO {
    private LocalDate date;
    private Long totalCount;
    private Long doneCount;
    private Integer achievementRate;

    public DailyAchievementDTO(LocalDate date, long totalCount, long doneCount) {
        this.date = date;
        this.totalCount = totalCount;
        this.doneCount = doneCount;
        this.achievementRate = (totalCount == 0) ? 0 : (int) Math.round(doneCount * 100.0 / totalCount);
    }
}
