import React from "react";
import styles from "./Message.module.css";
import moment from "moment";
import { Link } from "react-router-dom";
const classNames = require("classnames");

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a second",
    ss: "%d seconds",
    m: "a min",
    mm: "%d mins",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    w: "a week",
    ww: "%d weeks",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

export default function Message(props) {
  return (
    <Link to={"/message/" + props.message.With.Username}>
      <div className={styles.message}>
        <img
          alt="some alt"
          className={classNames(styles.senderAvatar, {
            [styles.online]: props.online,
          })}
          src="/images/avatar.jpg"
        />
        <div className={styles.messageDetail}>
          <h3 className={styles.senderName}>{props.message.With.Username}</h3>
          <p className={styles.messageSum}>
            {props.message.LastMessage?.Message || ""}
          </p>
        </div>
        <div className={styles.messageInfo}>
          <h5 className={styles.messageTime}>
            {moment(props.message.LastMessage.time).fromNow()}
          </h5>
          {props.unreadCount ? (
            <span className={styles.unreadBadge}>
              {props.message.unreadCount}
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
    </Link>
  );
}
