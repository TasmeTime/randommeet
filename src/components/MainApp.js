import React, { useState } from "react";
import Messages from "./Messages";
import { Switch, Route } from "react-router-dom";
import NavMenu from "./NavMenu";
import Chat from "./Chat";
export default function MainApp({ socket, cu }) {
  const [showNavMenu, setShowNavMenu] = useState(true);
  return (
    <>
      <Switch>
        <Route path="/messages">
          <Messages socket={socket} cu={cu} />
        </Route>
        <Route path="/message/:username">
          <Chat socket={socket} cu={cu} showNavMenu={setShowNavMenu} />
        </Route>
        <Route path="/profile/:username"></Route>
        <Route path="/find">FIND</Route>
        <Route path="/profile">PROFILE</Route>
        <Route path="/">
          <Messages socket={socket} cu={cu} />
        </Route>
      </Switch>
      {showNavMenu ? <NavMenu /> : ""}
    </>
  );
}
