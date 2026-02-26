package com.Kev.Tasks.mappers;

import com.Kev.Tasks.domain.dto.TaskListDto;
import com.Kev.Tasks.domain.entities.TaskList;

public interface TaskListMapper {


    TaskList fromDto(TaskListDto taskListDto);

    TaskListDto toDto (TaskList taskList);




}
