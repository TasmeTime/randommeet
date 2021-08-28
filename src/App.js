import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { BrowserRouter as Router } from "react-router-dom";
import Welcome from "./components/Welcome";
import MainApp from "./components/MainApp";
import "./App.scss";

let classNames = require("classnames");

function App() {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    Token: localStorage.getItem("auth_token"),
  });

  // useEffect(() => {
  //   setCurrentUser();
  // }, []);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:23021`, {
      "sync disconnect on unload": true,
      auth: {
        token: currentUser?.Token || null,
      },
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
      if (socket) {
        socket.close();
      }
    };
  }, [setSocket, currentUser]);

  function loginDone(user) {
    console.log("ld", user);
    localStorage.setItem("auth_token", user.Token);
    setCurrentUser(user);
  }

  return (
    <Router>
      <div className="app">
        {currentUser?.Token ? (
          <MainApp socket={socket} cu={currentUser} />
        ) : (
          <Welcome socket={socket} loginDone={loginDone} />
        )}
      </div>
    </Router>
  );
}

export default App;
