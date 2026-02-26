import { parseDate } from "@internationalized/date";
import {
  Button,
  Checkbox,
  DateInput,
  Progress,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
} from "@nextui-org/react";
import { ArrowLeft, Edit, Minus, Plus, Trash } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../AppProvider";
import Task from "../domain/Task";
import { TaskStatus } from "../domain/TaskStatus";

const TaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const taskList = state.taskLists.find((tl) => tl.id === listId);

  useEffect(() => {
    const loadData = async () => {
      if (!listId) return;

      setIsLoading(true);
      try {
        if (!taskList) {
          await api.getTaskList(listId);
        }
        await api.fetchTasks(listId);
      } catch (error) {
        console.error("Error loading task list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [listId, taskList, api]);

  const completionPercentage = useMemo(() => {
    if (!listId || !state.tasks[listId]) return 0;

    const tasks = state.tasks[listId];
    const closed = tasks.filter(
      (t) => t.status === TaskStatus.CLOSED
    ).length;

    return tasks.length ? (closed / tasks.length) * 100 : 0;
  }, [state.tasks, listId]);

  const toggleStatus = (task: Task) => {
    if (!listId || !task.id) return;

    const updatedTask: Task = {
      ...task,
      status:
        task.status === TaskStatus.CLOSED
          ? TaskStatus.OPEN
          : TaskStatus.CLOSED,
    };

    api
      .updateTask(listId, task.id, updatedTask)
      .then(() => api.fetchTasks(listId));
  };

  const deleteTaskList = async () => {
    if (!listId) return;

    await api.deleteTaskList(listId);
    navigate("/");
  };

  const tableRows = () => {
    if (!listId || !state.tasks[listId]) return [];

    return state.tasks[listId].map((task) => (
      <TableRow key={task.id ?? crypto.randomUUID()} className="border-t">
        <TableCell className="px-4 py-2">
          <Checkbox
            isSelected={task.status === TaskStatus.CLOSED}
            onValueChange={() => toggleStatus(task)}
            aria-label={`Mark task "${task.title}" as ${
              task.status === TaskStatus.CLOSED ? "open" : "closed"
            }`}
          />
        </TableCell>

        <TableCell className="px-4 py-2">{task.title}</TableCell>

        <TableCell className="px-4 py-2">{task.priority}</TableCell>

        <TableCell className="px-4 py-2">
          {task.dueDate && (
            <DateInput
              isDisabled
              defaultValue={parseDate(
                new Date(task.dueDate).toISOString().split("T")[0]
              )}
              aria-label={`Due date for task "${task.title}"`}
            />
          )}
        </TableCell>

        <TableCell className="px-4 py-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              aria-label={`Edit task "${task.title}"`}
              onClick={() => {
                if (!listId || !task.id) return;
                navigate(`/task-lists/${listId}/edit-task/${task.id}`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              aria-label={`Delete task "${task.title}"`}
              onClick={() => {
                if (!listId || !task.id) return;
                api.deleteTask(listId, task.id);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          aria-label="Go back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-2xl font-bold">
          {taskList?.title ?? "Unknown Task List"}
        </h1>

        <Button
          variant="ghost"
          aria-label="Edit task list"
          onClick={() => {
            if (!listId) return;
            navigate(`/edit-task-list/${listId}`);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={completionPercentage} className="mb-4" />

      <Button
        className="mb-4 w-full"
        aria-label="Add new task"
        onClick={() => {
          if (!listId) return;
          navigate(`/task-lists/${listId}/new-task`);
        }}
      >
        <Plus className="h-4 w-4" /> Add Task
      </Button>

      <div className="border rounded-lg overflow-hidden">
        <Table aria-label="Tasks list">
          <TableHeader>
            <TableColumn>Completed</TableColumn>
            <TableColumn>Title</TableColumn>
            <TableColumn>Priority</TableColumn>
            <TableColumn>Due Date</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>{tableRows()}</TableBody>
        </Table>
      </div>

      <Spacer y={4} />

      <div className="flex justify-end">
        <Button
          color="danger"
          startContent={<Minus size={20} />}
          aria-label="Delete task list"
          onClick={deleteTaskList}
        >
          Delete TaskList
        </Button>
      </div>
    </div>
  );
};

export default TaskListScreen;