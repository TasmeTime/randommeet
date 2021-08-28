import React from "react";
import styles from "./Modal.module.css";
let classNames = require("classnames");

export default function Modal(props) {
  return (
    <div
      className={classNames(styles.modal, { [styles.show]: props.show })}
      id="signUpModal"
    >
      <div
        onClick={() => {
          if (
            props.onBackgroundClick &&
            typeof props.onBackgroundClick === "function"
          )
            props.onBackgroundClick();
        }}
        className={styles.background}
      ></div>
      <div
        className={classNames(styles.modal_body, {
          [`${styles.md_small}`]: props.small ? true : false,
        })}
      >
        {props.children}
      </div>
    </div>
  );
}
