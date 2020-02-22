import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect, Link } from "react-router-dom";
import { globalContext } from "./App";
import { MinervaArchive } from "./../utils/managers/MinervaInstance";

import { uuidv4, Typist } from "./../utils/misc";
import bcrypt from "bcryptjs";

const text = {
  pre: "incomplete...",
  post: "enter"
};

let timeouts = [];

export const Signup = props => {
  const {
    setStatusText,
    statusMessage,
    setStatusMessage,
    setLoggedIn,
    loginScreenInstead,
    routeProps
  } = props;

  const { location } = routeProps;

  const clearAll = () => {
    for (let i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
  };

  const [finished, setFinished] = useState(false);
  const [userValid, setUserValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const [shouldOnboard, setShouldOnboard] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [allValid, setAllValid] = useState(false);

  const [shake, setShake] = useState(false);
  const [enterText, setEnterText] = useState("");

  useEffect(
    () => {
      if (!allValid) {
        new Typist(setEnterText, text.pre).scramble();
      } else {
        new Typist(setEnterText, text.post).scramble();
      }
    },
    [allValid]
  );

  const { minerva, audiomanager } = useContext(globalContext);

  const shakeAnim = (type = "error") => {
    if (shake) setShake(false);

    if (type === "warn") audiomanager.play("w_one");
    if (type === "error") audiomanager.play("e_one");

    setShake(true);

    setTimeout(() => setShake(false), 250);
  };

  useEffect(() => {
    if (location.state) if (!location.state.playaudio) return;

    audiomanager.play("i_one");
  }, []);

  useEffect(
    () => {
      if (userValid && passwordValid && confirmValid) setAllValid(true);
      else if (userValid && passwordValid && loginScreenInstead)
        setAllValid(true);
      else setAllValid(false);
    },
    [userValid, passwordValid, confirmValid]
  );

  const passwordInput = useRef(null);
  const usernameInput = useRef(null);

  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  const onSubmitForm = e => {
    e.preventDefault();

    if (e.repeat) return;

    let shouldSubmit;

    if (loginScreenInstead) shouldSubmit = userValid && passwordValid;
    else shouldSubmit = userValid && passwordValid && confirmValid;

    if (loginScreenInstead) {
      if (shouldSubmit) {
        // submit form
        // login user
        const user = {
          name: usernameInput.current.value,
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
            clearAll();
            timeouts.push(setTimeout(t, 3000));
          } else {
            bcrypt.compare(user.password, u.password, (err, res) => {
              console.log({ err, res });

              if (res) {
                audiomanager.play("s_two");

                setStatusMessage({
                  display: true,
                  text: "login complete.",
                  type: "success"
                });

                clearAll();
                timeouts.push(setTimeout(t, 3000));

                // create user's minerva instance
                minerva.login(u);

                console.log("user during login", u);

                console.log("after login", minerva);

                MinervaArchive.set("minervas_akasha", {
                  user: minerva.user,
                  id: minerva.userId
                });

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

                clearAll();
                timeouts.push(setTimeout(t, 3000));
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

        clearAll();
        timeouts.push(setTimeout(t, 3000));
      }
    } else {
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
              id: uuidv4(),
              name: usernameInput.current.value
            };

            minerva.search(newUser).then(user => {
              // do new user things

              if (!user) {
                minerva.set(newUser.name, newUser, "user");

                // create user's minerva instance
                minerva.login(newUser, true);

                console.log(minerva);

                audiomanager.play("s_two");

                setStatusMessage({
                  display: true,
                  text: "status: signup successful.",
                  type: "success"
                });

                setTimeout(t, 3000);

                // MinervaArchive.set("minervas_akasha", {
                //   user: minerva.user,
                //   id: minerva.userId
                // });

                setShouldOnboard(true);
                setFadeOut(true);

                setTimeout(() => {
                  setFinished(true);
                  setLoggedIn(true);
                }, 500);
              } else {
                // if user exists in localstorage
                console.log(newUser);

                setStatusMessage({
                  display: true,
                  text: "error: user already exists! please log in.",
                  type: "warning"
                });

                shakeAnim("warn");

                clearAll();
                timeouts.push(setTimeout(t, 3000));
              }
            });
          });
        });
      } else {
        shakeAnim();

        // popup message
        setStatusMessage({
          display: true,
          text: "error: invalid form",
          type: "fail"
        });

        clearAll();
        timeouts.push(setTimeout(t, 3000));
      }
    }
  };

  const manageInput = e => {
    const { name, value } = e.target;
    const { value: confirm } = passwordInput.current;

    switch (name) {
      case "username":
        if (value.length >= 3 && !/\s/gi.test(value)) setUserValid(true);
        if (/\s/gi.test(value)) {
          shakeAnim("warn");

          // popup message
          setStatusMessage({
            display: true,
            text: "warning: username cannot contain spaces",
            type: "warning"
          });

          clearAll();
          timeouts.push(setTimeout(t, 3000));
        } else if (value.length < 3) setUserValid(false);

        break;
      case "password":
        if (value.length >= 8 && !/\s/gi.test(value)) setPasswordValid(true);
        if (/\s/gi.test(value)) {
          shakeAnim("warn");

          // popup message
          setStatusMessage({
            display: true,
            text: "warning: password cannot contain spaces",
            type: "warning"
          });

          clearAll();
          timeouts.push(setTimeout(t, 3000));
        } else if (value.length < 8) setPasswordValid(false);

        break;
      case "confirm":
        if (value === confirm && confirm.length > 0 && passwordValid)
          setConfirmValid(true);
        else setConfirmValid(false);

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
        {loginScreenInstead ? (
          <form>
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
            <div>
              <button
                onClick={onSubmitForm}
                className={allValid ? "valid" : ""}
                type="submit"
              >
                <span>{enterText}</span>
                <b />
              </button>
            </div>
          </form>
        ) : (
          <form>
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
              <button
                onClick={onSubmitForm}
                className={allValid ? "valid" : ""}
                type="submit"
              >
                <span>{enterText}</span>
                <b />
              </button>
            </div>
          </form>
        )}

        <div className="login-link">
          <Link to={loginScreenInstead ? "/signup" : "/login"}>
            or {loginScreenInstead ? "sign up" : "log in"} here
          </Link>
        </div>
      </section>
    </section>
  );
};
