import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Redirect, Link } from "react-router-dom";
import bcrypt from "bcryptjs";

export const Login = props => {
  const { statusMessage, setStatusMessage, minerva } = props;

  const [finished, setFinished] = useState(false);
  const [userValid, setUserValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [allValid, setAllValid] = useState(false);

  useEffect(
    () => {
      if (userValid && passwordValid) setAllValid(true);
      else setAllValid(false);
    },
    [userValid, passwordValid]
  );

  const passwordInput = useRef(null);
  const usernameInput = useRef(null);

  const onSubmitForm = e => {
    e.preventDefault();

    const t = () => setStatusMessage({ ...statusMessage, type: null });

    const shouldSubmit = userValid && passwordValid;

    if (shouldSubmit) {
      // submit form
      // login user
      const user = {
        username: usernameInput.current.value,
        password: passwordInput.current.value
      };

      minerva.search(user).then(u => {
        console.log(u, user);

        if (!u) {
          setStatusMessage({
            display: true,
            text: "user does not exist.",
            type: "fail"
          });

          setTimeout(t, 3000);
        } else {
          bcrypt.compare(user.password, u.password, (err, res) => {
            console.log({ err, res });

            if (res) {
              setStatusMessage({
                display: true,
                text: "login complete.",
                type: "success"
              });

              setTimeout(t, 3000);

              // create user's minerva instance
              minerva.login(u);

              setFadeOut(true);

              setTimeout(() => setFinished(true), 500);
            } else {
              setStatusMessage({
                display: true,
                text: "incorrect credentials.",
                type: "fail"
              });

              setTimeout(t, 3000);
            }
          });
        }
      });
    } else {
      // popup message
      setStatusMessage({
        display: true,
        text: "please enter a valid username and password.",
        type: "fail"
      });

      setTimeout(t, 3000);
    }
  };

  const manageInput = e => {
    const { name } = e.target;

    switch (name) {
      case "username":
        if (e.target.value.length >= 3) setUserValid(true);
        if (e.target.value.length < 3) setUserValid(false);

        break;
      case "password":
        if (e.target.value.length >= 8) setPasswordValid(true);
        if (e.target.value.length < 8) setPasswordValid(false);

        break;
    }
  };

  return finished ? (
    <Redirect to="/home" />
  ) : (
    <section className={fadeOut ? "fadeout" : ""} id="login-signup">
      <section className="spinning-squares">
        <div />
        <div />
        <div />
        <div />
      </section>

      <section id="form-container">
        <form onSubmit={onSubmitForm}>
          <div className={userValid ? "valid" : ""}>
            <input
              ref={usernameInput}
              autoComplete="username"
              onInput={manageInput}
              type="text"
              name="username"
              placeholder="name"
              id="username"
            />
          </div>
          <b>
            <b />
          </b>
          <div className={passwordValid ? "valid" : ""}>
            <input
              ref={passwordInput}
              autoComplete="current-password"
              onInput={manageInput}
              type="password"
              name="password"
              placeholder="password"
              id="password"
            />
          </div>
          <b>
            <b />
          </b>
          <div>
            <button className={allValid ? "valid" : ""} type="submit">
              <span>enter</span>
              <b />
            </button>
          </div>
        </form>

        <div className="login-link">
          <Link to="/">or sign up here</Link>
        </div>
      </section>
    </section>
  );
};
