import React, { useState, useEffect, useRef } from "react";
import { Redirect, Link } from "react-router-dom";

import { uuidv4 } from "./../utils/misc";
import bcrypt from "bcryptjs";

export const Signup = props => {
  const { statusMessage, setStatusMessage, minerva, setLoggedIn } = props;

  const [finished, setFinished] = useState(false);
  const [userValid, setUserValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [shake, setShake] = useState(false);

  const shakeAnim = () => {
    if (shake) setShake(false);

    setShake(true);

    setTimeout(() => setShake(false), 250);
  };

  const [allValid, setAllValid] = useState(false);

  useEffect(
    () => {
      if (userValid && passwordValid && confirmValid) setAllValid(true);
      else setAllValid(false);
    },
    [userValid, passwordValid, confirmValid]
  );

  const passwordInput = useRef(null);
  const usernameInput = useRef(null);

  const t = () => setStatusMessage({ ...statusMessage, type: null });

  const onSubmitForm = e => {
    e.preventDefault();

    const shouldSubmit = userValid && passwordValid && confirmValid;

    if (shouldSubmit) {
      // submit form
      // create new user
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.log(err);

          setStatusMessage({
            display: true,
            text: err,
            type: "fail"
          });

          return setTimeout(t, 3000);
        }

        bcrypt.hash(passwordInput.current.value, salt, (err, hash) => {
          if (err)
            return setStatusMessage({
              display: true,
              text: err,
              type: "fail"
            });

          const newUser = {
            dateCreated: new Date().toISOString(),
            password: hash,
            records: {},
            id: uuidv4(),
            username: usernameInput.current.value
          };

          minerva.search(newUser).then(user => {
            // do new user things

            if (!user) {
              minerva.set(newUser.username, newUser, "user");

              // create user's minerva instance
              minerva.login(newUser, true);

              console.log(minerva);

              setStatusMessage({
                display: true,
                text: "signup successful.",
                type: "success"
              });

              setTimeout(t, 3000);

              setFadeOut(true);
              setLoggedIn(true);

              setTimeout(() => setFinished(true), 500);
            } else {
              console.log(newUser);

              setStatusMessage({
                display: true,
                text: "user already exists! please log in.",
                type: "warning"
              });

              shakeAnim();

              setTimeout(t, 3000);
            }
          });
        });
      });
    } else {
      shakeAnim();

      // popup message
      setStatusMessage({ display: true, text: "invalid form", type: "fail" });

      setTimeout(t, 3000);
    }
  };

  const manageInput = e => {
    const { name, value } = e.target;
    const { value: confirm } = passwordInput.current;

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
      case "confirm":
        if (value === confirm) setConfirmValid(true);
        if (value !== confirm) setConfirmValid(false);

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
              autoComplete="off"
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
          <div className={confirmValid ? "valid" : ""}>
            <input
              onInput={manageInput}
              autoComplete="current-password"
              type="password"
              name="confirm"
              placeholder="confirm password"
              id="confirm-pass"
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
          <Link to="/login">or log in here</Link>
        </div>
      </section>
    </section>
  );
};
