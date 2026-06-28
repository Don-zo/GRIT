package grit.domain.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AchievementOverviewResponseDTO {
    private List<DailyAchievementDTO> last7Days;
    private DailyAchievementDTO today;
}
