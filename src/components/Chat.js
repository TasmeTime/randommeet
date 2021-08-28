import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import Loading from "./common/Loading";

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

export default function Chat({ showNavMenu, socket, cu }) {
  const [messageInput, setMessageInput] = useState("");
  const [oldMessages, setOldMessages] = useState([]);
  const [messages, setMessages] = useState([]);

  const [isTypingTO, setIsTypingTO] = useState(null);
  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState({
    UserName: "",
    Id: "",
    IsOnline: false,
  });

  let history = useHistory();
  const token = localStorage.getItem("auth_token");
  let { username } = useParams();
  let bottomEl;
  let newMessageAudio = new Audio("/audio/knock.mp3");

  useEffect(() => {
    showNavMenu(false);

    if (socket) {
      socket.on("CONVERSATION_NEW_MSG", ({ message }) => {
        setMessages((messages) => {
          return [...messages, message];
        });
        setOtherUserIsTyping(false);
        newMessageAudio.play();
      });

      socket.on("CHAT_NEW_DM_RES", (data) => {
        if (data.error) {
          console.error("CHAT_NEW_DM_RES", data.error);
          return;
        }

        setMessages((messages) => {
          return [...messages, data.message];
        });
        newMessageAudio.play();
      });

      socket.on("USER_STATUS_CHANGE", ({ StatusType, NewStatus, Data }) => {
        if (!StatusType || !NewStatus) return;
        if (StatusType === "ACTIVITY") {
          switch (NewStatus) {
            case "OFFLINE":
              // setIsOnline(false);
              setOtherUser({ ...otherUser, IsOnline: false });
              break;
            case "ONLINE":
              // setIsOnline(true);
              setOtherUser({ ...otherUser, IsOnline: true });
              break;
            case "STOP_IS_TYPING":
              if (Data.UserName == username) setOtherUserIsTyping(false);
              break;
            case "START_IS_TYPING":
              if (Data.UserName == username) setOtherUserIsTyping(true);
              break;
            default:
              console.log("invalid status change");
              break;
          }
        }
      });

      socket.on("GET_USER_FOR_CHAT_RES", (data) => {
        console.log(data);
        if (data.error) {
          console.error("GET_USER_FOR_CHAT_RES error:", data.error);
          history.goBack();
        }

        setOtherUser({
          Username: data.user.Username,
          Id: data.user.Id,
          IsOnline: data.user.IsOnline,
        });
        // setIsOnline(data.user.IsOnline);
        setOldMessages(data.user.Messages);
        setLoading(false);
      });

      console.log(1);
      setLoading(true);
      socket.emit("GET_USER_FOR_CHAT_REQ", {
        Token: token,
        Username: username,
      });
      console.log(2);
    }

    return () => {
      showNavMenu(true);
      if (socket) {
        socket.off("CONVERSATION_NEW_MSG");
        socket.off("CHAT_NEW_DM_RES");
        socket.off("USER_STATUS_CHANGE");
        socket.off("GET_USER_FOR_CHAT_RES");
      }
    };
  }, [socket]);

  function sendMessage() {
    if (!messageInput) return;
    socket.emit("CHAT_NEW_DM", {
      message: messageInput,
      target: username,
      token,
    });
    setMessageInput(null);
    bottomEl.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className={styles.chatContainer}>
      {loading ? <Loading /> : ""}
      <div className={styles.topBar}>
        <div
          className={styles.backButton}
          onClick={() => {
            history.goBack();
          }}
        >
          <i className="bi bi-chevron-left"></i>
        </div>
        <h3>Maria</h3>
        <div className={styles.avatar}>
          <img width={50} height={50} src="/images/avatar.jpg" />
          <span
            style={{ display: otherUser.IsOnline ? "inline" : "none" }}
          ></span>
        </div>
      </div>
      <div className={styles.convoContainer}>
        {oldMessages.map((m) => {
          return (
            <div
              key={m.Id}
              className={
                m.SenderId === cu.Id ? styles.selfMessage : styles.othersMessage
              }
            >
              <p>{m.Message}</p>
              <span>{moment(m.SendDate).fromNow()}</span>
            </div>
          );
        })}
        {messages.map((m) => {
          return (
            <div
              key={m.Id}
              className={
                m.SenderId === cu.Id ? styles.selfMessage : styles.othersMessage
              }
            >
              <p>{m.Message}</p>
              <span>{moment(m.SendDate).fromNow()}</span>
            </div>
          );
        })}
        {otherUserIsTyping ? (
          <div className={styles.isTyping}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          ""
        )}
        <div
          style={{ float: "left", clear: "both" }}
          ref={(el) => {
            bottomEl = el;
          }}
        ></div>
      </div>
      <div className={styles.inputContainer}>
        <textarea
          value={messageInput || ""}
          onChange={(e) => {
            socket.emit("USER_NEW_STATUS", {
              StatusType: "ACTIVITY",
              NewStatus: "START_IS_TYPING",
              Data: {
                Token: token,
              },
            });
            setMessageInput(e.target.value);
          }}
          placeholder="Message ..."
          className={styles.input}
          onKeyUp={(e) => {
            if (isTypingTO) clearTimeout(isTypingTO);
            setIsTypingTO(
              setTimeout(() => {
                socket.emit("USER_NEW_STATUS", {
                  StatusType: "ACTIVITY",
                  NewStatus: "STOP_IS_TYPING",
                  Data: {
                    Token: token,
                  },
                });
              }, 1500)
            );
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        ></textarea>
        <i
          onClick={() => {
            sendMessage();
          }}
          className="bi-arrow-right-short"
        ></i>
      </div>
    </section>
  );
}
