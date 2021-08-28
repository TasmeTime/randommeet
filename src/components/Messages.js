import React, { useState, useEffect } from "react";
import Message from "./common/Message";
import { useHistory } from "react-router";
import styles from "./Messages.module.css";

export default function Messages({ socket, cu }) {
  const [conversations, setConversations] = useState([]);
  const [loadingConvo, setLoadingConvo] = useState(false);
  let notif = new Audio("/audio/notif1.wav");

  useEffect(() => {
    if (socket) {
      socket.on("GET_CONVERSATIONS_RES", (res) => {
        console.log(res);
        if (res.error) {
          setLoadingConvo(false);
          console.error("get convo error: " + res.error);
          return;
        }
        setConversations(res.conversations);
        setLoadingConvo(false);
      });

      socket.on("CONVERSATION_NEW_MSG", ({ message }) => {
        console.log("CONVERSATION_NEW_MSG", message);
        const msg = {
          _id: message.Id,
          SendDate: message.SendDate,
          SenderId: message.SenderId,
          Message: message.Message,
        };
        const res = conversations.find((c) => {
          // console.log("rere", c.With.UserId, message.SenderId);
          return c.With.UserId === message.SenderId;
        });
        console.log(conversations, message);
        // console.log("res", res, typeof message.SenderId);
        if (res) {
          console.log("1");
          setConversations((conversations) => {
            return conversations.map((c) => {
              if (c.With.UserId === message.SenderId) {
                return {
                  ...c,
                  IsOnline: true,
                  LastMessage: msg,
                };
              } else return c;
            });
          });
        } else {
          console.log("2");
          setConversations([
            ...conversations,
            {
              IsOnline: true,
              With: {
                UserId: message.SenderId,
                Username: message.SenderUsername,
              },
              LastMessage: msg,
              ConversationId: message.ConvId,
            },
          ]);
        }

        notif.play();
      });

      socket.on("USER_STATUS_CHANGE", ({ StatusType, NewStatus, Data }) => {
        if (!StatusType || !NewStatus) return;
        setConversations((conversations) => {
          let nc = conversations.map((c) => {
            let tmp;
            tmp = c;

            if (c.With.UserId == Data.UserId) {
              if (NewStatus === "ONLINE") tmp.IsOnline = true;
              else if (NewStatus === "OFFLINE") tmp.IsOnline = false;
            }
            return tmp;
          });
          return nc;
        });
      });

      setLoadingConvo(true);
      socket.emit("GET_CONVERSATIONS_REQ", localStorage.getItem("auth_token"));
    }
    return () => {
      if (socket) {
        socket.off("GET_CONVERSATIONS_RES");
        socket.off("CONVERSATION_NEW_MSG");
        socket.off("USER_STATUS_CHANGE");
      }
    };
  }, [socket]);

  function logOut() {
    localStorage.removeItem("auth_token");
    window.location = "/";
  }

  return (
    <section className={styles.messagesContainer}>
      <div className={styles.topBar}>
        <h2>{loadingConvo ? "LOADING..." : "Messages"}</h2>
        <img onClick={() => logOut()} src="/images/avatar.jpg" alt="some alt" />
      </div>
      <div className={styles.search}>
        <i className="bi-search"></i>
        <input type="text" name="search" placeholder="Search..." />
      </div>
      {loadingConvo ? "LOADING..." : ""}
      {!loadingConvo && conversations.length <= 0 ? (
        <div className={styles.startChatting}>
          <h2>NO MESSAGE YET?! Start messaging right now!</h2>
        </div>
      ) : (
        ""
      )}
      <div className={styles.messageList}>
        {conversations.map((m) => {
          return (
            <Message online={m.IsOnline} key={m.ConversationId} message={m} />
          );
        })}
      </div>
    </section>
  );
}
