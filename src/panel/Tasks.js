import React from "react";

import { useActiveTasks } from "../db/tasks/hooks";
import Task from "../components/Task";
import { AppToaster } from '../components/Notification';
import {
    Intent,
    Button,
    Colors
} from "@blueprintjs/core";

import { saveAs } from 'file-saver';
import moment from 'moment';

export default function Tasks () {
    const {
        tasks,
        doneTask,
        deleteTask,
        selectTodo
    } = useActiveTasks();

    const selectTodoNotification = async (task) => {
        const msg = task.description.length > 10?task.description.substring(0, 10) + "...":task.description;

        try {
            await selectTodo(task);

            AppToaster.show({
                message: `Task ${msg} is set TODO.`,
                intent: Intent.SUCCESS
            });
        }
        catch (e) {
            AppToaster.show({
                message: `Error setting todo task: ${msg}`,
                intent: Intent.DANGER
            });

        }
    
    };

    function exportTasks () {
        var tasksBlob = new Blob([JSON.stringify(tasks, null, '\t')], {type: "text/plain;charset=utf-8"});
        saveAs(tasksBlob, `tasks-${moment().toISOString()}.json`);
    }

    const tasksList = tasks.map(
        task => <Task 
                task={task}
                doneTask={doneTask}
                deleteTask={deleteTask}
                selectTodo={selectTodoNotification}
                canEditTask={true}
                key={task._id}
            ></Task>
    );

    return (
        <section style={{overflow: "auto"}}>
            <div style={{
                position: "fixed", 
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                padding: "0.2em",
                backgroundColor: Colors.BLUE5
            }}>
                <Button icon="download" onClick={exportTasks}>Export</Button>
            </div>
            <article style={{marginTop: "3em"}}>
                {tasksList}
            </article>
        </section>
    );
}

