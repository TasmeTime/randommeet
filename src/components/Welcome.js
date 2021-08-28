import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Modal from "./common/Modal";
import ButtonGroup from "./common/ButtonGroup";

export default function Welcome({ socket, loginDone }) {
  const [logInData, setLogInData] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentState, setCurrentState] = useState("idle");
  let history = useHistory();

  useEffect(() => {
    if (socket) {
      socket.on("LOGIN_RES", (res) => {
        if (res.error) {
          console.error("Login Erorr: " + res.error);
          setLoginLoading(false);
          return;
        }

        // localStorage.setItem("auth_token", res.token);
        loginDone(res.user);
        history.push("/messages");
        setLoginLoading(false);
        console.log(res);
      });
    }
  }, [socket]);

  return (
    <>
      <Modal
        onBackgroundClick={() => setCurrentState("idle")}
        small
        show={currentState === "signIn"}
      >
        <div className="login">
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={logInData.username}
              onChange={(e) =>
                setLogInData((logInData) => {
                  return { ...logInData, username: e.target.value };
                })
              }
              name="username"
            />
          </div>
          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input
              value={logInData.password}
              onChange={(e) =>
                setLogInData((logInData) => {
                  return { ...logInData, password: e.target.value };
                })
              }
              type="password"
              id="password"
              name="password"
            />
          </div>
          <button
            className="btn border"
            onClick={() => {
              setLoginLoading(true);
              socket.emit("LOGIN_REQ", logInData);
            }}
          >
            {loginLoading ? "..." : "Log In"}
          </button>
        </div>
      </Modal>
      <Modal
        onBackgroundClick={() => setCurrentState("idle")}
        show={currentState === "signUp"}
      >
        <div className="signUp">
          <div className="avatarContainer">
            <div className="avatar">
              <svg
                width="30"
                height="34"
                viewBox="0 0 30 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.75 7.625C20.75 10.7316 18.2316 13.25 15.125 13.25C12.0184 13.25 9.5 10.7316 9.5 7.625C9.5 4.5184 12.0184 2 15.125 2C18.2316 2 20.75 4.5184 20.75 7.625Z"
                  stroke="#292D32"
                  strokeWidth="3"
                />
                <path
                  d="M2 32V25.548C2 23.5286 3.15591 21.6823 5.04722 20.9745C7.59848 20.0196 11.9 18.875 15.125 18.875C18.418 18.875 22.0721 20.0684 24.9529 21.0346C26.9685 21.7106 28.25 23.6308 28.25 25.7567V32"
                  stroke="#292D32"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input type="text" id="name" name="name" placeholder="your name" />
          </div>
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>

          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
          </div>

          <div className="input-container">
            <label>Gender</label>
            <ButtonGroup values={["male", "female", "other"]} />
          </div>

          <div className="input-container">
            <label htmlFor="lookingFor">Looking For</label>
            <ButtonGroup
              values={["male", "female", "other"]}
              default="female"
            />
          </div>

          <button className="btn btn-primary">Sign Up</button>
        </div>
      </Modal>

      <section className="frontPage">
        <div className="hero">
          <h3 className="text-secondary">welcome to</h3>
          <h1 className="text-primary">Random Meet</h1>
          <div className="btn-container">
            <button
              onClick={() => setCurrentState("signUp")}
              className="btn btn-primary"
            >
              Sign Up
            </button>
            <h4 className="text-secondary">Or</h4>
            <button
              onClick={() => setCurrentState("signIn")}
              className="btn btn-secondary"
            >
              Log In
            </button>
          </div>
        </div>
        <h6 className="footer">
          designed and developed by tasmetime <br /> 2021
        </h6>
      </section>
    </>
  );
}
