import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import {
  Button,
  Position,
  Divider,
  Card,
  Elevation,
  Switch
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { useActiveTags } from "../../db/tasks/hooks";
import { addTaskText, splitTask, parseValue } from "./editor";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

/*
export default function TaskEditor({
  task,
  onSave,
  canSplitTask = false,
  width = "100%",
  height = "8em"
}) {

  const { t } = useTranslation();

  const [value, setValue] = useState(task ? task.description : "");
  const { tags } = useActiveTags();

  const newTags = parseValue(value, tags);
  const submit = () => {
    if (addTaskText(task, value, onSave)) {
      setValue("");
    }
  };

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{ height: "100%" }}
    >
      <TextInput
        options={newTags}
        trigger="#"
        offsetY={-50}
        offsetX={15}
        style={{ width, height }}
        value={value}
        onChange={setValue}
        placeholder={
          t("EDIT_PLACEHOLDER")
          /*
          "a. Write here the task description, use # to add #tags!!\n" +
          "b. Use [ ] and [X] to render checkboxes.\n" +
          "c. Add Shortcut: Ctrl+Enter"*/
/*}
onKeyPress={e => {
  const code = e.keyCode || e.which;
  if (code === 13 && e.ctrlKey) {
    submit();
  }
}}
/>
<Divider />
<Button
position={Position.RIGHT}
onClick={submit}
disabled={value.trim() === ''}
>{t(task ? "SAVE" : "ADD")}</Button>
</Card>
);

}
*/

export default function TaskEditor({
  task,
  onSave,
  canSplitTask = false,
  width = "100%",
  height = "8em"
}) {

  const [valueA, setValueA] = useState(task ? task.description : "");
  const [valueB, setValueB] = useState(task ? task.description : "");

  const { t } = useTranslation();

  const { tags } = useActiveTags();

  const newTags = parseValue(valueA, tags).concat(parseValue(valueB, tags));

  const [split, setSplit] = useState(false);

  const submitText = t(task ? (split ? "SPLIT" : "SAVE") : "ADD");

  const submit = () => {
    if (split) {
      splitTask(task, valueA, valueB, onSave);
    }
    else if (addTaskText(task, valueA, onSave)) {
      setValueA("");
    }
  };

  return (
    <>
      {canSplitTask && <Switch checked={split} label={t("SPLIT")} onChange={e => setSplit(e.target.checked)} />}
      <Card
        interactive={true}
        elevation={Elevation.TWO}
        style={{ height: "100%" }}
      >
        <TextInput
          options={newTags}
          trigger="#"
          offsetY={-50}
          offsetX={15}
          style={{ width: "100%", height: split ? "45%" : height }}
          value={valueA}
          onChange={setValueA}
          placeholder={t("EDIT_PLACEHOLDER")}
        />
        {canSplitTask && split &&
          <TextInput
            options={newTags}
            trigger="#"
            offsetY={-50}
            offsetX={15}
            style={{ width: "100%", height: "45%" }}
            value={valueB}
            onChange={setValueB}
            placeholder={t("EDIT_PLACEHOLDER")}
          />
        }
        <Divider />
        <Button
          position={Position.RIGHT}
          onClick={submit}
          disabled={valueA.trim() === '' || (split && valueB.trim() === '')}
        >{submitText}</Button>
      </Card>
    </>
  );

}
