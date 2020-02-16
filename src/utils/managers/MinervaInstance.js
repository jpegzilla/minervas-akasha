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
    this.record = null;

    this.settings = settings;

    this.database = database;

    this.userId = null;
  }

  login(user, newUser = false, database = false) {
    this.user = user;
    this.userId = user.id;

    this.set(`user:${user.id}:token`, {
      user: user,
      expires: new Date().toISOString()
    });

    if (newUser) {
      this.record = new AkashicRecord(
        user.id,
        user.dateCreated,
        uuidv4(),
        user.name,
        user.records,
        this.database
      );
    } else {
      this.record = AkashicRecord.retrieveAkashicRecord(
        user.id,
        user.name,
        database
      );
    }

    this.save();
  }

  logout(user) {
    MinervaArchive.remove("minervas_akasha");
    MinervaArchive.remove(user.name);
    Minerva.removeSession("loggedIn");
  }

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
          if (!res) reject("nothing found");
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
                this.database.insert(item, type).then(res => {
                  if (!res) reject("setting item failed");
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

  save() {
    const store = {
      user: this.user,
      settings: this.settings,
      storage: this.storage
    };

    MinervaArchive.set("minervaStore", store);
  }

  load() {
    return JSON.parse(MinervaArchive.get("minervaStore"));
  }

  setSession(key, item) {
    Minerva._session.setItem(key, JSON.stringify(item));
  }

  static removeSession(key) {
    Minerva._session.removeItem(key);
  }

  getSession(key) {
    return JSON.parse(Minerva._session.getItem(key));
  }

  static clearSessionStorage() {
    Minerva._session.clear();
  }

  remove(key, item, database = false, type) {
    if (database) {
      this.database.delete(this.database.collections[type], item.id);
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

// storage interaction utility methods

export class MinervaArchive extends Minerva {
  static get(key) {
    return JSON.parse(Minerva._store.getItem(key));
  }

  static remove(key) {
    return Minerva._store.removeItem(key);
  }

  static set(key, item) {
    Minerva._store.setItem(key, JSON.stringify(item));

    return Minerva._store;
  }
}
