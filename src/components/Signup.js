import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect, Link } from "react-router-dom";
import { MinervaArchive } from "./../utils/managers/MinervaInstance";
import PropTypes from "prop-types";
import { uuidv4, Typist } from "./../utils/misc";
import { globalContext } from "./App";
import bcrypt from "bcryptjs";

// text for when the form is complete or incomplete
const text = {
  pre: "incomplete...",
  post: "enter"
};

// container for all timeouts. this way, if all timeouts need to be cleared,
// I can loop through this array to clear them all.
let timeouts = [];

export const Signup = props => {
  const {
    setStatusText,
    setStatusMessage,
    loginScreenInstead,
    routeProps
  } = props;

  const { location } = routeProps;

  const clearAll = () => timeouts.forEach(t => clearTimeout(t));

  const [finished, setFinished] = useState(false);
  const [userValid, setUserValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [allValid, setAllValid] = useState(false);

  const [shake, setShake] = useState(false);
  const [enterText, setEnterText] = useState("");

  // if fields are valid, write the confirmation text. if not, write the denial text.
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

  // error function that just shakes the form and plays an error sound
  const shakeAnim = (type = "error") => {
    if (shake) setShake(false);

    if (type === "warn") audiomanager.play("w_one");
    if (type === "error") audiomanager.play("e_one");

    setShake(true);

    setTimeout(() => setShake(false), 250);
  };

  // if this page has been reached from somewhere where the intro sound should not play,
  // location.state.playaudio will be false. this prevents the intro sound from playing.
  useEffect(
    () => {
      if (location.state) if (!location.state.playaudio) return;

      audiomanager.play("i_one");
    },
    [audiomanager, location.state]
  );

  // determine whether all fields are valid or not.
  useEffect(
    () => {
      if (userValid && passwordValid && confirmValid) setAllValid(true);
      else if (userValid && passwordValid && loginScreenInstead)
        setAllValid(true);
      else setAllValid(false);
    },
    [loginScreenInstead, userValid, passwordValid, confirmValid]
  );

  const passwordInput = useRef(null);
  const usernameInput = useRef(null);

  // simple function to clear the status message
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

                // set akashic record with stored data here!!
                // AkashicRecord

                // create user's minerva instance
                minerva.login(u);

                // set minervas_akasha, a key made in order to determine the current
                // signed-in user
                MinervaArchive.set("minervas_akasha", {
                  user: minerva.user,
                  id: minerva.userId
                });

                setFadeOut(true);

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
        // submit form if all necessary inputs are valid
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

            // this object is only created once, on initial signup. it is important that
            // the id and datecreated never change after initial creation.
            const newUser = {
              dateCreated: new Date().toISOString(),
              password: hash,
              id: uuidv4(),
              name: usernameInput.current.value
            };

            // minerva search in order to make sure the user actually exists
            minerva.search(newUser).then(user => {
              // if user doesn't exist after attempting to sign up
              // (which it should not)
              if (!user) {
                minerva.set(newUser.name, newUser, "user");

                // create user's minerva instance
                minerva.login(newUser, true);

                console.log(minerva);

                audiomanager.play("s_two");

                // set akashic record with stored data here!!
                // AkashicRecord

                setFadeOut(true);

                setTimeout(() => {
                  setFinished(true);
                }, 500);
              } else {
                // if user exists in localstorage, warn the user to just go ahead and log in
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
        // this block is sort of a catch-all for any mistakes the user made in the form
        shakeAnim();

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

  // function that fires on input. validates all fields and plays
  // warnings if input is invalid in some way.
  const manageInput = e => {
    const { name, value } = e.target;
    const { value: confirm } = passwordInput.current;

    switch (name) {
      case "username":
        if (value.length >= 3 && !/\s/gi.test(value)) setUserValid(true);

        // detect any spaces in username
        if (/\s/gi.test(value)) {
          shakeAnim("warn");

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

        // detect any spaces in password
        if (/\s/gi.test(value)) {
          shakeAnim("warn");

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

      default:
        throw new Error(
          "this error should only show if there were another input on the form that wasn't a username or password input. how did you even get this to happen...?"
        );
    }
  };

  // if finished, and all is good, redirect to the home screen.
  // otherwise, render the signup screen or the login screen
  // depending on the path ('/login' or '/signup').

  if (finished) {
    return (
      <Redirect
        to={{ pathname: "/", state: loginScreenInstead ? "login" : "signup" }}
      />
    );
  }

  return (
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

Signup.propTypes = {
  setStatusText: PropTypes.func,
  setStatusMessage: PropTypes.func,
  loginScreenInstead: PropTypes.bool,
  routeProps: PropTypes.object
};
