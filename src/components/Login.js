import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Redirect, Link } from "react-router-dom";
import bcrypt from "bcryptjs";

export const Login = props => {
  const { statusMessage, setStatusMessage, minerva, setLoggedIn } = props;

  const [finished, setFinished] = useState(false);
  const [userValid, setUserValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [shake, setShake] = useState(false);

  const shakeAnim = () => {
    setShake(true);

    setTimeout(() => setShake(false), 500);
  };

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

          shakeAnim();

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

              setLoggedIn(true);

              setTimeout(() => setFinished(true), 500);
            } else {
              setStatusMessage({
                display: true,
                text: "incorrect credentials.",
                type: "fail"
              });

              shakeAnim();

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

      shakeAnim();

      setTimeout(t, 3000);
    }
  };

  const manageInput = e => {
    const { name, value } = e.target;

    switch (name) {
      case "username":
        if (value.length >= 3 && !/\s/gi.test(value)) setUserValid(true);
        if (/\s/gi.test(value)) {
          shakeAnim();

          // popup message
          setStatusMessage({
            display: true,
            text: "username cannot contain spaces",
            type: "warning"
          });

          setTimeout(t, 3000);
        } else if (value.length < 3) setUserValid(false);

        break;
      case "password":
        if (value.length >= 8 && !/\s/gi.test(value)) setPasswordValid(true);
        if (/\s/gi.test(value)) {
          shakeAnim();

          // popup message
          setStatusMessage({
            display: true,
            text: "password cannot contain spaces",
            type: "warning"
          });

          setTimeout(t, 3000);
        } else if (value.length < 8) setPasswordValid(false);

        break;
    }
  };

  return finished ? (
    <Redirect to="/" />
  ) : (
    <section className={fadeOut ? "fadeout" : ""} id="login-signup">
      <section className="spinning-squares">
        <div />
        <div />
        <div />
        <div />
      </section>

      <section className={shake ? "shake" : ""} id="form-container">
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
          <Link to="/signup">or sign up here</Link>
        </div>
      </section>
    </section>
  );
};
