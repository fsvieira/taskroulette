import { db, selectTodo, setTodoFilterTags, changes } from "./db";
import { $activeSprintsTasks } from "../sprints/streams";
import { fromBinder } from "baconjs"
import moment from "moment";

export const $todo = () =>
    fromBinder(sink => {
        const find = () => db.query(q => q.findRecord({ type: "todo", id: "todo" })).then(
            todo => { console.log("TODO::: ", todo); sink(todo); },
            err => {
                db.requestQueue.skip();

                console.log("TODO", err);
                sink({
                    relationships: {
                        tags: {
                            data: [{ type: "tag", id: "all" }]
                        }
                    }
                })
            }
        );

        /*
        const find = () => db.query(q => q.findRecord({ type: "todo", id: "todo" })).then(
            todo => {
                console.log(todo);
                return sink({ tags: { all: true } });
            },
            err => {
                console.log(err);
                return sink({ tags: { all: true } });
            }
        );*/

        // const find = () => sink({ tags: { all: true } });

        const cancel = changes(find);

        find();

        return cancel;
    });

export const $activeTodo = tags =>
    $todo().combine($activeSprintsTasks(tags), (todo, { sprints, tasks }) => {
        console.log("TODO: ", todo);
        const t = { ...todo };

        console.log("ACTIVE TODO", t.relationships, tasks.length);

        if (tasks.length === 0 && Object.keys(todo.relationships.tags.data).length > 1) {
            setTodoFilterTags({ all: true });
        }

        if (t.relationships.task) {
            const task = tasks.find(task => task.id === t.relationships.task.id);

            if (!task || task.deleted || task.done) {
                delete t.task;
            }
            else {
                t.task = task;
            }

            t.total = tasks.length;
        }

        if (!t.relationships.task && tasks.length) {
            const now = moment().valueOf();
            let total = 0;

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const rank = task.computed.sprints.length
                    + (now - moment(task.createdAt).valueOf())
                    + task.computed.sprints.reduce((acc, sprint) => {
                        return acc + sprint.doneAvg - sprint.taskDueAvg
                    }, 0)
                    ;

                total += rank;
                task.computed.rank = rank;
            }

            tasks.forEach(task => {
                task.computed.rank = task.computed.rank / total;
            });

            tasks.sort((a, b) => a.computed.rank - b.computed.rank);

            const r = Math.random();

            let accum = 0;
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const a = accum + task.computed.rank;
                if (a >= r) {
                    t.task = task;
                    selectTodo(task);
                    break;
                }
                else {
                    accum = a;
                }
            }
        }

        return t;
    });


