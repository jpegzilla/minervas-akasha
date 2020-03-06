import AkashicRecord from "./../structures/AkashicRecord";
import { uuidv4 } from "./../misc";
// class for managing everything that goes on in the app, specifically users logging
// in / out and managing state of the data structures in the akashic record.

// it's also responsible for storing the overall state of the application, including
// volume, graphical settings, preferences, etc.
export class Minerva {
  constructor(options, database) {
    this.user = options.user || null;

    // if a user exists already, get their record. otherwise, the record is
    // an empty object.
    this.record = this.user
      ? AkashicRecord.retrieveAkashicRecord(
          this.user.id,
          this.user.name,
          database
        )
      : {};

    this.settings = MinervaArchive.get("minerva_store")
      ? MinervaArchive.get("minerva_store").settings
      : {
          volume: {
            master: 100,
            effect: 100,
            voice: 100
          },
          connections: true
        };

    this.windows = MinervaArchive.get("minerva_store")
      ? MinervaArchive.get("minerva_store").windows
      : [];

    this.database = database;

    // maybe don't do this?
    this.userId = options.user ? options.user.id : null;
  }

  addRecord(
    id,
    type,
    data = {
      tags: [],
      id: "",
      connectedTo: [],
      accepts: [],
      colorCode: ""
    }
  ) {
    console.log(this);
    console.log(type);
    this.record.addToRecord(id, type, data, this);
  }

  // removeRecord(id, type) {
  //   this.record[type].filter(item => item.id !== id);
  // }

  // update(id, data) {
  //   this.record[type].map(item => {
  //     if (item.id === id) return { ...item, data };
  //     return item;
  //   });
  // }

  setWindows(array) {
    this.windows = array;
    this.save();
  }

  changeSetting(settings) {
    this.settings = settings;
    this.save();
  }

  login(user, newUser = false, database = false) {
    this.user = user;
    this.userId = user.id;

    this.set(
      `user:${user.id}:token`,
      {
        user: user,
        expires: new Date().toISOString()
      },
      "user"
    );

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
    // MinervaArchive.remove("minervas_akasha");
    // MinervaArchive.remove(user.name);

    MinervaArchive.set("logged_in", false);

    this.user = null;
    this.record = null;
    this.userId = null;

    this.settings = {};
  }

  search(user, database = false) {
    console.trace("trace user from search,", user);

    if (database) {
      // search in database
    }

    return new Promise((resolve, _reject) => {
      if (this.get(user.name)) {
        resolve(this.get(user.name));
      } else resolve(false);
    });
  }

  get(item, type, database = false) {
    // type is only for searching in the database
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

      default:
        throw new Error("invalid type provided to minerva.set");
    }
  }

  save() {
    const store = {
      user: this.user,
      settings: this.settings,
      storage: this.storage,
      records: this.record,
      windows: this.windows
    };

    MinervaArchive.set("minerva_store", store);
  }

  load() {
    return JSON.parse(MinervaArchive.get("minerva_store"));
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
    if (database)
      this.database.delete(this.database.collections[type], item.id);

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
