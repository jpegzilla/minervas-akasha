import AkashicRecord from "./../structures/AkashicRecord";
import DatabaseInterface from "./Database";
import { uuidv4, validateUUIDv4 } from "./../misc";
import worker from "workerize-loader!./workers/compressionWorker"; // eslint-disable-line import/no-webpack-loader-syntax

const workerInstance = worker();

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
   * @constructor
   * @struct
   *
   * @returns {type} Description
   */
  constructor(options, database) {
    if (!database instanceof DatabaseInterface)
      throw new TypeError("database must be an instance of DatabaseInterface.");

    if (options.user && !validateUUIDv4(options.user.id))
      throw new Error(
        `user was created with an invalid user id: ${options.user.id}`
      );

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

    // open indexedDB instance
    let db = window.indexedDB.open("minerva_db");

    // this will be given a value when the database is successfully opened
    this.indexedDB = null;

    db.onerror = event => {
      console.warn("error with indexedDB", event.target.errorCode);
    };

    db.onsuccess = event => {
      console.log("indexedDB success.", event);

      // this part makes sure that the indexedDB property is set only if
      // the success event that fired was an IDBOpenDBRequest.
      if (event.target instanceof IDBOpenDBRequest) {
        this.indexedDB = event.target.result;
      }
    };

    // if a version is specified that is higher than the existing version
    db.onupgradeneeded = event => {
      console.log("running database upgrade");

      const db = event.target.result;

      // create object store with keypath of id. keypath will cause
      // the object store to use that key as a unique index.
      const objectStore = db.createObjectStore("minerva_files", {
        keyPath: "id"
      });

      // names can contain duplicates, but can be used to search the database
      objectStore.createIndex("name", "name", { unique: false });

      // an index to search documents by name. must be unique
      objectStore.createIndex("id", "id", { unique: true });
    };

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

    this.recordUpdated = 0;
    this.indexedDBUpdated = new Date().toISOString();
  }

  updateIndexedDBUpdatedTimestamp() {
    this.indexedDBUpdated = new Date().toISOString();
  }

  updateRecordUpdatedTimeStamp() {
    this.recordUpdated = new Date().toISOString();
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
    if (!id || !validateUUIDv4(id) || !structure)
      throw new Error("missing arguments to addToRecord.");

    this.updateRecordUpdatedTimeStamp();
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
    if (!id || !validateUUIDv4(id) || !type)
      throw new Error("invalid arguments to Minerva.removeFromRecord.");

    this.updateRecordUpdatedTimeStamp();
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
    if (!key || !validateUUIDv4(id) || !type || !value)
      throw new Error("invalid arguments to Minerva.editInRecord.");

    this.updateRecordUpdatedTimeStamp();
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
    if (!array || !Array.isArray(array))
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
    if (!settings || typeof settings !== "object")
      throw new TypeError("invalid parameters to minerva.changeSetting");

    this.settings = settings;
    this.save();
  }

  resetRecords() {
    this.record.resetRecords();
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
    if (!user || typeof user !== "object")
      throw new Error("Minerva.login requires a user object.");

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
    // because the minervas_akasha key is meant to represent the currently
    // logged-in user, this key must be removed on logout.
    MinervaArchive.remove("minervas_akasha");
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
    if (!user) throw new Error("Minerva.get requires a user object.");

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
    if (!key) throw new Error("Minerva.get requires a key.");

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
    if (!name || !type)
      throw new Error("invalid arguments passed to Minerva.set.");

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

  // compression / decompression methods
  lzCompress(base64String) {
    return new Promise((resolve, reject) => {
      try {
        workerInstance.postMessage({
          action: "compress",
          toCompress: base64String
        });

        workerInstance.onmessage = message => {
          resolve(message.data);
        };
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  }

  lzDecompress(data) {
    return new Promise((resolve, reject) => {
      try {
        workerInstance.postMessage({
          action: "decompress",
          toDecompress: data
        });

        workerInstance.onmessage = message => {
          resolve(message.data);
        };
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  }

  /**
   * addFileToRecord - add a file to a record, adding an entry for
   * the structure in indexeddb
   *
   * @param {string} id        id of structure associated with file
   * @param {object} file      file object to add to the database
   * @param {object} structure structure to add file to
   *
   * @returns {void} undefined
   */
  addFileToRecord(id, file, structure, compress = false) {
    if (!id || !validateUUIDv4(id) || !file || !structure)
      throw new Error("invalid arguments passed to Minerva.addFileToRecord.");

    // take this.records and store them in the database
    const transaction = this.indexedDB.transaction(
      ["minerva_files"],
      "readwrite"
    );

    const { type } = structure;

    const objectStore = transaction.objectStore("minerva_files");

    if (compress) {
      return new Promise((resolve, reject) => {
        // compress file before storing
        this.lzCompress(file.data).then(res => {
          // take this.records and store them in the database
          const transaction = this.indexedDB.transaction(
            ["minerva_files"],
            "readwrite"
          );

          const { type } = structure;

          const objectStore = transaction.objectStore("minerva_files");

          const req = objectStore.put({
            id,
            userId: this.user.id,
            file: { ...file, data: res },
            type,
            fileType: "audio"
          });

          req.onsuccess = () => {
            resolve();
            this.updateIndexedDBUpdatedTimestamp();
          };
        });
      });
    } else {
      // otherwise just store immediately
      const req = objectStore.put({
        id,
        userId: this.user.id,
        file,
        type
      });

      req.onsuccess = () => {
        this.updateIndexedDBUpdatedTimestamp();
      };
    }
  }

  updateFileInRecord(id, key, value) {
    if (!id || !validateUUIDv4(id) || !key || !value)
      throw new Error(
        "invalid arguments passed to Minerva.updateFileInRecord."
      );

    const objectStore = this.indexedDB
      .transaction(["minerva_files"], "readwrite")
      .objectStore("minerva_files");

    const request = objectStore.get(id);

    return new Promise((resolve, reject) => {
      request.onerror = event => {
        reject({ status: "error", event });
      };

      request.onsuccess = event => {
        // get the old value that we want to update
        const data = event.target.result;

        // update the value(s) in the object that you want to change
        data[key] = value;

        // put this updated object back into the database.
        const requestUpdate = objectStore.put(data);

        requestUpdate.onerror = event => {
          // do something with the error
          reject({ status: "error", event });
        };

        requestUpdate.onsuccess = event => {
          // success - the data is updated!
          this.updateIndexedDBUpdatedTimestamp();
          resolve({ status: "success", event });
        };
      };
    });
  }

  /**
   * removeFileFromRecord - remove a file from a record in indexeddb.
   *
   * @param {string} id id of the record to be removed.
   *
   * @returns {type} Description
   */
  removeFileFromRecord(id) {
    if (!id || !validateUUIDv4(id))
      throw new Error("invalid id passed to Minerva.removeFileFromRecord.");

    const request = this.indexedDB
      .transaction(["minerva_files"], "readwrite")
      .objectStore("minerva_files")
      .delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        this.updateIndexedDBUpdatedTimestamp();
        resolve();
      };

      request.onerror = e => {
        reject(e);
      };
    });
  }

  /**
   * findFileInRecord - find a file object belonging to a certain record.
   *
   * @param {string} id id string of the record in question.
   *
   * @returns {promise} resolves when the database request completes,
   * rejects on error.
   */
  findFileInRecord(id, compressed = false) {
    if (!id || !validateUUIDv4(id))
      throw new Error("invalid id passed to Minerva.findFileInRecord.");

    const transaction = this.indexedDB.transaction(["minerva_files"]);
    const objectStore = transaction.objectStore("minerva_files");
    const request = objectStore.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = event => {
        console.log("result from findFileInRecord", event.target.result);

        if (event.target.result) {
          if (compressed) {
            // decompress file.data here

            this.lzDecompress(event.target.result.file.data).then(res => {
              const fileInformation = {
                ...event.target.result,
                file: { ...event.target.result.file, data: res }
              };

              resolve(fileInformation);
            });
          } else {
            resolve(event.target.result);
          }
        }
      };

      request.onerror = e => {
        reject(e);
      };
    });
  }

  save() {
    const store = {
      user: this.user,
      settings: this.settings,
      storage: this.storage,
      records: MinervaArchive.get("minerva_store")
        ? {
            ...MinervaArchive.get("minerva_store").records,
            [this.user.id]: this.record
          }
        : { [this.user.id]: this.record },
      windows: this.windows
    };

    MinervaArchive.set("minerva_store", store);

    return this;
  }

  load() {
    return JSON.parse(MinervaArchive.get("minerva_store"));
  }

  setSession(key, item) {
    if (!key || !item)
      throw new Error(
        "Minerva.setSession must be called with a key and an item."
      );

    Minerva._session.setItem(key, JSON.stringify(item));
  }

  static removeSession(key) {
    if (!key)
      throw new Error("Minerva.removeSession must be called with a key.");

    Minerva._session.removeItem(key);
  }

  getSession(key) {
    if (!key) throw new Error("Minerva.getSession must be called with a key.");

    return JSON.parse(Minerva._session.getItem(key));
  }

  static clearSessionStorage() {
    Minerva._session.clear();
  }

  /**
   * @static getCookie - get the value of a cookie.
   *
   * @param {string} key key of the cookie you want to read.
   *
   * @returns {string} the value of the retrieved cookie.
   */
  static getCookie(key) {
    if (key === undefined)
      throw new Error("getCookie must be called with a key.");

    return document.cookie
      .split(";")
      .map(item => ({ [item.split("=")[0].trim()]: item.split("=")[1].trim() }))
      .find(item => Object.keys(item)[0] === key)[key];
  }

  /**
   * @static removeCookie - deletes a cookie.
   *
   * @param {string} key key of cookie to delete.
   *
   * @returns {string} the remaining cookies.
   */
  static removeCookie(key) {
    if (key === undefined)
      throw new Error("removeCookie must be called with a key.");

    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    return document.cookie;
  }

  /**
   * @static setCookie - set a cookie.
   *
   * @param {string} key      key of cookie
   * @param {string} value    value of cookie
   * @param {string} maxage   date of expiration
   * @param {string} expires  also date of expiration.
   * @param {string} secure   a flag that determines whether to
   * only transfer this cookie over https.
   * @param {string} samesite prevents the browser from sending
   * this cookie in cross-site requests.
   *
   * @returns {string} the current cookies.
   */
  static setCookie(key, value, maxage, expires, secure, samesite) {
    if (maxage !== undefined && expires !== undefined) {
      throw new TypeError("maxage / expires cannot be undefined.");
    }

    if (key === undefined || value === undefined) {
      throw new Error("setCookie must be called with a key and a value.");
    }

    if (typeof samesite === "string" && !["lax", "strict"].includes(samesite)) {
      throw new SyntaxError(
        "samesite must be set to either 'lax' or 'strict'."
      );
    }

    document.cookie = `${key}=${value};max-age=${maxage}${
      expires ? `;expires=${expires}` : ""
    }${secure ? `;secure` : ""}${samesite ? `;samesite=${samesite}` : ""}`;

    return document.cookie;
  }

  remove(key, item, database = false, type) {
    if (!key || !item || !type)
      throw new Error("invalid arguments to Minerva.remove.");

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
 */
export class MinervaArchive {
  static get(key) {
    if (!key) throw new Error("MinervaArchive.get must be called with a key.");

    return JSON.parse(Minerva._store.getItem(key));
  }

  static remove(key) {
    if (!key)
      throw new Error("MinervaArchive.remove must be called with a key.");

    return Minerva._store.removeItem(key);
  }

  static set(key, item) {
    if (!key || !item)
      throw new Error(
        "MinervaArchive.set must be called with both a key and a value."
      );

    Minerva._store.setItem(key, JSON.stringify(item));

    return Minerva._store;
  }
}
