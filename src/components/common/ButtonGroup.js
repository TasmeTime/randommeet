import React, { useState } from "react";

import styles from "./ButtonGroup.module.css";
let classNames = require("classnames");

export default function ButtonGroup(props) {
  const [gender, setGender] = useState(
    props.default ? props.default : props.values[0]
  );

  function generateItemContent(value) {
    return <>{value}</>;
  }

  if (!props.values || !Array.isArray(props.values)) {
    console.error(
      '"values" should be a valid array and it is mandatory to specified!'
    );
    return <>ERROR - check the logs</>;
  }

  if (props.generator) {
    if (typeof props.generator === "function")
      generateItemContent = props.generator;
    else {
      console.error(
        '"generator" must be a valid function which returns valid JSX!'
      );
      return <>ERROR - check the logs</>;
    }
  }

  if (props.changed && typeof props.changed !== "function") {
    console.error('"changed" must be a valid function!');
    return <>ERROR - check the logs</>;
  }

  return (
    <div className={styles.groupContainer}>
      {props.values.map((v) => {
        return (
          <div
            key={v + Math.random() * 100}
            className={classNames(styles.item, {
              [`${styles.active}`]: gender === v,
            })}
            onClick={(e) => {
              setGender(v);
              if (props.changed) props.changed(v);
            }}
          >
            {v}
          </div>
        );
      })}
    </div>
  );
}
