import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NavMenu.module.css";
const classNames = require("classnames");

export default function NavMenu(props) {
  const [currentPage, setCurrentPage] = useState("messages");
  return (
    <nav className={styles.navMenu}>
      <li
        className={classNames(styles.navItem, {
          [styles.active]: currentPage === "messages",
        })}
        onClick={() => setCurrentPage("messages")}
      >
        <Link to="/messages">
          <i className="bi-chat-square-dots"></i>
        </Link>
      </li>
      <li
        className={classNames(styles.navItem, {
          [styles.active]: currentPage === "find",
        })}
        onClick={() => setCurrentPage("find")}
      >
        <Link to="/find">
          <i className="bi-search "></i>
        </Link>
      </li>
      <li
        className={classNames(styles.navItem, {
          [styles.active]: currentPage === "profile",
        })}
        onClick={() => setCurrentPage("profile")}
      >
        <Link to="/profile">
          <i className="bi-person "></i>
        </Link>
      </li>
    </nav>
  );
}
