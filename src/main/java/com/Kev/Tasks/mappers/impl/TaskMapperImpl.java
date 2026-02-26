package com.Kev.Tasks.mappers.impl;

import com.Kev.Tasks.domain.dto.TaskDto;
import com.Kev.Tasks.domain.entities.Task;
import com.Kev.Tasks.mappers.TaskMapper;
import org.springframework.stereotype.Component;

@Component
public class TaskMapperImpl  implements TaskMapper {
    @Override
    public Task fromDto(TaskDto taskDto) {
        return new Task(
                taskDto.id(),
                taskDto.title(),
                taskDto.description(),
                taskDto.dueDate(),
                taskDto.status(),      // TaskStatus
                taskDto.priority(),    // TaskPriority
                null,
                null,
                null
        );
    }

    @Override
    public TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),    // TaskPriority
                task.getStatus()       // TaskStatus

        );
    }
}
