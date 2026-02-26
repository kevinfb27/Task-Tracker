package com.Kev.Tasks.mappers;

import com.Kev.Tasks.domain.dto.TaskDto;
import com.Kev.Tasks.domain.entities.Task;

public interface TaskMapper {


    Task fromDto(TaskDto taskDto);

    TaskDto toDto(Task task);


}
