import AkashicRecord from "./../structures/AkashicRecord";
import Database from "./Database";
import { uuidv4 } from "./../misc";

// class for managing everything that goes on in the app, specifically users logging
// in / out and managing state of the data structures in the akashic record.

// it's also responsible for storing the overall state of the application, including
// volume, graphical settings, preferences, etc.
export class Minerva {
  constructor(settings, database) {
    this.user = null;

    this.settings = settings;

    this.database = database;
  }

  login(user, newUser = false) {
    this.user = user;

    this.set(`user:${user.userId}:token`, {
      user: user,
      expires: new Date().toISOString()
    });

    if (newUser) {
      this.record = new AkashicRecord(
        user.userId,
        user.dateCreated,
        uuidv4(),
        user.username,
        user.records
      );
    } else {
      this.record = AkashicRecord.retrieveAkashicRecord(
        user.userId,
        user.username
      );
    }
  }

  logout() {}

  search(user, database = false) {
    if (database) {
      // search in database
    }

    return new Promise((resolve, _reject) => {
      if (this.get(user.username)) {
        resolve(this.get(user.username));
      } else resolve(false);
    });
  }

  get(item, type, database = false) {
    if (database) {
      return new Promise((resolve, reject) => {
        this.database.find(item, type).then(res => {
          if (!res) reject("user creation failed");
          else resolve(res);
        });
      });
    }

    return JSON.parse(Minerva._store.getItem(item));
  }

  set(name, item, type, database = false) {
    switch (type) {
      case "user":
        if (database) {
          // add to database

          return new Promise((resolve, reject) => {
            this.database.find(item, type).then(u => {
              if (!u) {
                this.database.create(item, type).then(res => {
                  if (!res) reject("user creation failed");
                  else resolve(res);
                });
              }
            });
          });
        }

        Minerva._store.setItem(name, JSON.stringify(item));

        return Minerva._store;

      case "data":
        break;
    }
  }

  setSession(key, item) {
    Minerva._session.setItem(key, JSON.stringify(item));
  }

  removeSession(key) {
    Minerva._session.removeItem(key);
  }

  getSession(key) {
    return JSON.parse(Minerva._session.getItem(key));
  }

  clearSession() {
    Minerva._session.clear();
  }

  remove(key, item, database = false) {
    if (database) {
      this.database.delete(item.id);
    }

    Minerva._store.removeItem(key);

    return Minerva._store;
  }

  static clearStorage() {
    return Minerva._store.clear();
  }

  static _store = window.localStorage;
  static _session = window.sessionStorage;
}
