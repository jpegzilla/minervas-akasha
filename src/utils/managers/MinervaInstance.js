import AkashicRecord from "./../structures/AkashicRecord";
import DatabaseInterface from "./Database";
import { uuidv4 } from "./../misc";
// class for managing everything that goes on in the app, specifically users logging
// in / out and managing state of the data structures in the akashic record.

// it's also responsible for storing the overall state of the application, including
// volume, graphical settings, preferences, etc.

/**
 * Minerva - class that manages settings and records within this application.
 * the ghost in the shell.
 */
export class Minerva {
  /**
   * constructor - instantiates an instance of minerva.
   *
   * @param {object} options  options object containing a user name string,
   * an instance of AkashicRecord, a settings object, an array of windows,
   * and a user id.
   * @param {DatabaseInterface} database an instance of the DatabaseInterface class
   *
   * @returns {type} Description
   */
  constructor(options, database) {
    if (!database instanceof DatabaseInterface)
      throw new TypeError("database must be an instance of DatabaseInterface.");

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

  /**
   * addToRecord - add a new structure to the record.
   *
   * @param {string} id           unique id for the structure.
   * @param {Structure} structure structure to add.
   *
   * @returns {undefined} void
   */
  addToRecord(id, structure) {
    this.record.addToRecord(id, structure, this);
    this.save();
  }

  /**
   * removeFromRecord - remove structure from the record.
   *
   * @param {string} id      unique id for the structure. provided to a structure upon
   * initiation, in the DataStructure component.
   * @param {Structure} type type of structure to remove.
   *
   * @returns {undefined} void
   */
  removeFromRecord(id, type) {
    this.record.removeFromRecord(id, type, this);
    this.save();
  }

  /**
   * editInRecord - edit a record in akasha
   *
   * @param {string} id   unique id of the record to edit
   * @param {string} type type of record to edit
   * @param {object} data data to give to the record
   *
   * @returns {Minerva} current instance of minerva
   */
  editInRecord(id, type, key, value) {
    this.record.editInRecord(id, type, key, value, this);
    this.save();
  }

  /**
   * setWindows - change the windows in minerva's window array.
   *
   * @param {array} array array of windows to set
   *
   * @returns {undefined} void
   */
  setWindows(array) {
    if (!Array.isArray(array))
      throw new TypeError("invalid parameters to minerva.setWindows");

    this.windows = array;
    this.save();
  }

  /**
   * changeSetting - change a setting in minerva's settings object.
   *
   * @param {object} settings object containing the settings to change.
   *
   * @returns {undefined} void
   */
  changeSetting(settings) {
    if (typeof settings !== "object")
      throw new TypeError("invalid parameters to minerva.changeSetting");

    this.settings = settings;
    this.save();
  }

  /**
   * login - a function to set a user as 'logged in' to the application.
   *
   * @param {object}  user             user object containing a user id, a date of
   * creation, a name, and a records object.
   * @param {boolean} [newUser=false]  true if user is creating an account for the first time.
   * @param {boolean} [database=false] true if the user needs to be loaded from the database.
   *
   * @returns {undefined} void
   */
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

  logout() {
    // MinervaArchive.remove("minervas_akasha");
    // MinervaArchive.remove(user.name);

    MinervaArchive.set("logged_in", false);

    this.user = null;
    this.record = null;
    this.userId = null;

    this.settings = {};
  }

  /**
   * search - use the database interface to search for a user,
   * or find user in localstorage.
   *
   * @param {object}  user             user object
   * @param {boolean} [database=false] whether or not to search only in database
   *
   * @returns {promise} promise that resolves when user is found, rejects on error,
   * or resolves false if user is not found.
   */
  search(user, database = false) {
    console.trace("trace user from search,", user);

    if (database) {
      // search in database
    }

    // promise so I can do something like
    // on login attempt: search(user).then(() => do login stuff)
    return new Promise((resolve, _reject) => {
      if (this.get(user.name)) {
        resolve(this.get(user.name));
      } else resolve(false);
    });
  }

  get(key, database) {
    // type is only for searching in the database
    if (database) {
      const { type } = database;
      return new Promise((resolve, reject) => {
        this.database.find(key, type).then(res => {
          if (!res) reject("nothing found");
          else resolve(res);
        });
      });
    }

    return JSON.parse(Minerva._store.getItem(key));
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

    return this;
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

/**
 * MinervaArchive - utility class for interacting with localstorage.
 * @extends Minerva
 */
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
