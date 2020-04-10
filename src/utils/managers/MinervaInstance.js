import AkashicRecord from "./../structures/AkashicRecord";
import DatabaseInterface from "./Database";
import { uuidv4, validateUUIDv4 } from "./../misc";
import { naturalDate } from "./../dateUtils";

import worker from "./workers/compressionWorker.worker";
import exportWorker from "./workers/exportWorker.worker";

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

    this.user = { ...options.user, password: "" } || null;

    // minerva's voice synth engine
    this.voice = null;

    this.usageData = {};

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

    // if there's already settings in storage, combine them with the default settings
    // just to add resilience in case more settings are added in the future - this
    // will allow us to avoid errors if there is an extra setting that wasn't previously
    // stored in localstorage when the app loads
    if (MinervaArchive.get("minerva_store")) {
      const settings = MinervaArchive.get("minerva_store").settings;

      const defaultSettings = Minerva.defaultSettings;

      if (Object.keys(settings).length === 0) {
        this.settings = defaultSettings;
      } else {
        this.settings = { ...defaultSettings, ...settings };
      }
    }

    // windows is an array of window objects that contain info on the windows contents / position
    this.windows = MinervaArchive.get("minerva_store")
      ? MinervaArchive.get("minerva_store").windows
      : [];

    // this should always be an instance of databaseinterface
    this.database = database;

    // userId that's the same as user.id. not sure what this would be for yet
    this.userId = options.user ? options.user.id : null;

    // records last update date
    this.recordUpdated = 0;
    // and indexeddb last update date
    this.indexedDBUpdated = new Date().toISOString();
  }

  static fileHeader = "minervas_akasha_alpha";

  // this is the single source of truth for the default application settings
  static get defaultSettings() {
    return {
      volume: {
        master: 100, // volume for media (videos / audio)
        effect: 100, // volume for sound effects like the typing sound, startup sound
        voice: 100 // volume for minerva's voice (not yet implemented)
      },
      timeFormat: true, // true sets 12 hour mode, false is 24 hour mode
      autoplayMedia: false, // dictates whether audio and video elements will autoplay.
      connections: true, // dictates whether users can see content from other users.
      filters: {
        crt: true,
        noise: false
      }, // enables / disables graphical filters.
      dateFormat: "ja-JP" // for formatting dates / times
    };
  }

  /**
   * updateIndexedDBUpdatedTimestamp - used to update the record's last update date
   *
   * @returns {AkashicRecord} the current akashic record
   */
  updateIndexedDBUpdatedTimestamp() {
    this.indexedDBUpdated = new Date().toISOString();
  }

  /**
   * updateRecordUpdatedTimeStamp - used to update indexeddb's last update date
   *
   * @returns {AkashicRecord} the current akashic record
   */
  updateRecordUpdatedTimeStamp() {
    this.recordUpdated = new Date().toISOString();

    return this.record;
  }

  /**
   * addToRecord - add a new structure to the record.
   *
   * @param {string} id           unique id for the structure.
   * @param {Structure} structure structure to add.
   *
   * @returns {AkashicRecord} the current akashic record
   */
  addToRecord(id, structure) {
    if (!id || !validateUUIDv4(id) || !structure)
      throw new Error("missing arguments to addToRecord.");

    this.updateRecordUpdatedTimeStamp();
    this.record.addToRecord(id, structure, this);
    this.save();

    return this.record;
  }

  /**
   * removeFromRecord - remove structure from the record.
   *
   * @param {string} id      unique id for the structure. provided to a structure upon
   * initiation, in the DataStructure component.
   * @param {Structure} type type of structure to remove.
   *
   * @returns {AkashicRecord} the current akashic record
   */
  removeFromRecord(id, type) {
    if (!id || !validateUUIDv4(id) || !type)
      throw new Error("invalid arguments to Minerva.removeFromRecord.");

    this.updateRecordUpdatedTimeStamp();
    this.record.removeFromRecord(id, type, this);
    this.save();

    return this.record;
  }

  /**
   * editInRecord - edit a record in akasha
   *
   * @param {string} id   unique id of the record to edit
   * @param {string} type type of record to edit
   * @param {object} data data to give to the record
   *
   * @returns {AkashicRecord} the current akashic record
   */
  editInRecord(id, type, key, value) {
    if (!key || !validateUUIDv4(id) || !type || !value)
      throw new Error("invalid arguments to Minerva.editInRecord.");

    this.updateRecordUpdatedTimeStamp();
    this.record.editInRecord(id, type, key, value, this);
    this.save();

    return this.record;
  }

  /**
   * connectRecord - connect one record (bidirectionally) to another.
   *
   * @param {object} item        record to connect.
   * @param {object} destination record to connect to
   *
   * @returns {AkashicRecord} the current akashic record
   */
  connectRecord(item, destination) {
    const destType = destination.type;
    const itemType = item.type;

    item.connectedTo[destination.id] = destination.id;
    destination.connectedTo[item.id] = item.id;

    // add the newly connected record to the records of item's type
    const newItemTypeRecords = this.record.records[itemType].map(r => {
      return r.id === item.id ? item : r;
    });

    // add the newly connected record to the records of destination's type
    const newDestTypeRecords = this.record.records[destType].map(r => {
      return r.id === destination.id ? destination : r;
    });

    this.record.records[itemType] = newItemTypeRecords;
    this.record.records[destType] = newDestTypeRecords;

    // if the current record is an athenaeum, a few extra steps must be handled here.
    if (destType === "hypostasis") {
      console.log(
        "the destination is a hypostasis! make sure that the connection is handled correctly."
      );
    }

    this.save();

    this.updateUsageData(
      "structures",
      Object.values(this.record.records).flat(Infinity).length
    );

    this.updateRecordUpdatedTimeStamp();

    return this.record;
  }

  /**
   * disconnectFromAll - disconnect the record with the provided id from all records
   * to which it is connected.
   *
   * @param {string} id uuid of structure to be deleted
   *
   * @returns {AkashicRecord} the current akashic record
   */
  disconnectFromAll(id) {
    // delete every entry for the specified id in every records connections object
    Object.entries(this.record.records).forEach(([_, v]) => {
      v.forEach(item => delete item.connectedTo[id]);
    });

    this.updateUsageData(
      "structures",
      Object.values(this.record.records).flat(Infinity).length
    );

    return this.record;
  }

  /**
   * disconnectRecord - disconnect a record from another specific record.
   *
   * @param {object} item        the record to be disconnected (the 'child' record)
   * @param {object} destination the record to be disconnected from (the 'parent' record)
   *
   * @returns {AkashicRecord} the current akashic record
   */
  disconnectRecord(item, destination) {
    const destType = destination.type;
    const itemType = item.type;

    const newItemTypeRecords = this.record.records[itemType].map(record => {
      // if this is the item I'm trying to disconnect, delete the
      // corresponding connectedTo entry
      if (record.id === item.id) {
        const r = record;
        delete r.connectedTo[destination.id];

        return r;
      }
      return record;
    });

    // do the same thing as above, but in the other 'direction'
    const newDestTypeRecords = this.record.records[destType].map(record => {
      if (record.id === destination.id) {
        const r = record;
        delete r.connectedTo[item.id];

        return r;
      }
      return record;
    });

    // set the records of the correct types to the newly formed arrays
    this.record.records[itemType] = newItemTypeRecords;
    this.record.records[destType] = newDestTypeRecords;

    this.save();

    this.updateRecordUpdatedTimeStamp();

    return this.record;
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
  changeSetting(settings, key, value) {
    if (!settings || typeof settings !== "object")
      throw new TypeError("invalid parameters to minerva.changeSetting");

    if (key && value !== undefined) {
      this.settings[key] = value;
      return void this.save();
    }

    this.settings = settings;
    this.save();
  }

  exportDataToJsonFile() {
    const t1 = performance.now();

    const mStore = MinervaArchive.get("minerva_store");
    const userStore = MinervaArchive.get(this.user.name);
    const db = this.indexedDB;

    const transaction = db.transaction(["minerva_files"], "readonly");

    const objectStore = transaction.objectStore("minerva_files");

    // promise that resolves when all values are retrieved from db
    const promiseVals = new Promise((resolve, reject) => {
      const reqVals = objectStore.getAll();

      reqVals.onsuccess = e => {
        resolve({ values: e.target.result });
      };

      reqVals.onerror = err => void reject({ status: "failure", err });
    });

    // promise that resolves when all keys are retrieved from db
    const promiseKeys = new Promise((resolve, reject) => {
      const reqKeys = objectStore.getAllKeys();

      reqKeys.onsuccess = e => {
        resolve({ keys: e.target.result });
      };

      reqKeys.onerror = err => void reject({ status: "failure", err });
    });

    return new Promise((resolveAll, rejectWithError) => {
      // wait for all values to be retrieved...
      Promise.all([promiseVals, promiseKeys])
        .then(result => {
          const res = {};
          const toExport = {};

          result.forEach(item => {
            if ("keys" in item) res.keys = item["keys"];
            if ("values" in item) res.values = item["values"];
          });

          res.values.forEach(item => {
            if (res.keys.includes(item.id)) toExport[item.id] = item;
            else
              rejectWithError(
                new Error({
                  message:
                    "malformed indexedDB object encountered. you should literally never ever see this error.",
                  items: res
                })
              );
          });

          const workerInstance = new exportWorker();

          workerInstance.postMessage({ data: toExport, action: "stringify" });

          workerInstance.addEventListener("message", e => {
            const exportObject = {
              minerva_file_header: Minerva.fileHeader,
              minerva_store: mStore,
              [`${this.user.name}${this.user.id}`]: userStore,
              minerva_db: e.data.minerva_db
            };

            const finalStringifyWorker = new exportWorker();

            finalStringifyWorker.postMessage({
              data: exportObject,
              action: "stringifyandblob"
            });

            finalStringifyWorker.addEventListener("message", e => {
              const dataUrl = e.data;

              const dlLink = document.createElement("a");
              dlLink.href = dataUrl;
              dlLink.download = `${
                this.user.name
              }${new Date().toISOString()}.json`;
              dlLink.rel = "noopener noreferrer";

              dlLink.click();

              const t2 = performance.now();

              console.log(`exportDataToJsonFile took ${t2 - t1}ms.`);
              resolveAll({ status: "success", link: e });
            });
          });
        })
        .catch(err => {
          console.log("error in catch in exportDataToJsonFile", err);
        });
    });
  }

  importDataFromJsonFile() {}

  resetRecords() {
    this.record.resetRecords(this);

    this.windows = this.windows.filter(item => {
      return item.component.toLowerCase() !== "datastructure";
    });

    this.setApplicationWindows([...this.windows]);

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

    this.usageData = MinervaArchive.get("minerva_store")
      ? MinervaArchive.get("minerva_store").usageData
      : {};

    this.settings = MinervaArchive.get("minerva_store")
      ? MinervaArchive.get("minerva_store").settings
      : Minerva.defaultSettings;

    this.set(
      `user:${user.id}:token`,
      {
        expires: naturalDate("1 month from now")
      },
      "user"
    );

    // if it's a new user, make them a brand new record.
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
      // if not a new user, get their record information
      // using the record's retrieval method.
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
    MinervaArchive.remove(`user:${this.user.id}:token`);

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

  /**
   * get - get an item from the database or from localstorage
   *
   * @param {string} key      key of item to get
   * @param {object} database database options including type (data / user)
   * of database table to search in
   *
   * @returns {(object|Promise)} either the found object, or an error object
   * returns promise that resolves with one of those things if working
   * with the database
   */
  get(key, database) {
    if (!key) throw new Error("Minerva.get requires a key.");

    // type is only for searching in the database
    if (database) {
      const { type } = database;
      return new Promise((resolve, reject) => {
        this.database
          .find(key, type)
          .then(res => {
            if (!res) reject({ status: "failure", message: "nothing found" });
            else resolve(res);
          })
          .catch(err => {
            reject({ status: "failure", message: err });
          });
      });
    }

    return JSON.parse(Minerva._store.getItem(key));
  }

  /**
   * set - set a key / value pair in the database or in localstorage
   *
   * @param {string}  key              key of item to store
   * @param {any}     value            value of item to store
   * @param {string}  type             type of data to insert (user / data)
   * @param {boolean} [database=false] if true, the insert action will be performed
   * in the database instead of localstorage.
   *
   * @returns {(object|Promise)} returns the current state of localstorage if using localstorage.
   * if using the database, returns a promise.
   */
  set(key, value, type, database = false) {
    if (key === undefined)
      throw new Error("invalid arguments passed to Minerva.set.");

    if (database) {
      // add to database

      return new Promise((resolve, reject) => {
        this.database.find(value, type).then(u => {
          if (!u) {
            this.database
              .insert(value, type)
              .then(res => {
                if (!res)
                  reject({
                    status: "failure",
                    message: "setting value failed"
                  });
                else resolve(res);
              })
              .catch(err => {
                reject({ status: "failure", message: err });
              });
          }
        });
      });
    }

    Minerva._store.setItem(key, JSON.stringify(value));

    return Minerva._store;
  }

  // compression / decompression methods

  /**
   * lzCompress - compress a string using lzutf8 compression
   *
   * @param {string} base64String base64 encoded string to compress
   *
   * @returns {Promise} promise that resolves with the compressed data
   * or rejects on an error
   */
  lzCompress(base64String) {
    return new Promise((resolve, reject) => {
      try {
        // this part takes a long time and is causing the ui
        // to lag when compressing / decompressing a large file
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

  /**
   * lzDecompress - decompress a lzutf8 compressed string
   *
   * @param {string} data compressed string to decompress
   *
   * @returns {Promise} resolves with the decompressed data, or rejects with an error.
   */
  lzDecompress(data) {
    return new Promise((resolve, reject) => {
      try {
        // this is the main part that causes the most lag.
        // passing in a large amount of data to this function seems to
        // block the main thread while waiting for the worker
        // to finish decompressing the file
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
   * @returns {undefined} undefined
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
        this.lzCompress(file.data)
          .then(res => {
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
              fileType: "audio",
              compressed: "lzutf8"
            });

            req.onsuccess = () => {
              resolve();
              this.updateIndexedDBUpdatedTimestamp();
            };
          })
          .catch(err => {
            console.log("error in lzCompress:", err);

            reject({ status: "failure", message: err });
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
        this.updateUsageData(
          "structures",
          Object.values(this.record.records).flat(Infinity).length
        );
        this.updateIndexedDBUpdatedTimestamp();
      };
    }
  }

  /**
   * updateFileInRecord - Description
   *
   * @param {string} id    id of record (structure id / structId)
   * @param {string} key   key to modify
   * @param {any}    value value to modify with
   *
   * @returns {Promise} resolves on success or rejects on failure
   */
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
          this.updateUsageData(
            "structures",
            Object.values(this.record.records).flat(Infinity).length
          );
          this.updateIndexedDBUpdatedTimestamp();
          resolve({ status: "success", event });
        };
      };
    });
  }

  /**
   * removeFileFromRecord - remove a file from a record in indexeddb.
   * this completely deletes the entry with the specified id in the
   * database.
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
        this.updateUsageData(
          "structures",
          Object.values(this.record.records).flat(Infinity).length
        );
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
  findFileInRecord(id) {
    if (!id || !validateUUIDv4(id))
      throw new Error("invalid id passed to Minerva.findFileInRecord.");

    const transaction = this.indexedDB.transaction(["minerva_files"]);
    const objectStore = transaction.objectStore("minerva_files");
    const request = objectStore.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = event => {
        if (event.target.result) {
          if (event.target.result.compressed) {
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

  /**
   * save - stores all information that needs to be stored in localstorage.
   * storing: user info, settings info, storage info, record info, and window info.
   *
   * @returns {Minerva} the current instance of minerva.
   */
  save() {
    const store = {
      user: this.user,
      settings: this.settings,
      storage: this.storage,
      usageData: this.usageData,
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

  updateUsageData(type, value) {
    const today = `${new Date()
      .getDate()
      .toString()
      .padStart(2, "0")}-${new Date().getMonth() +
      1}-${new Date().getFullYear()}`;

    const timeOfUpdate = `${new Date()
      .getHours()
      .toString()
      .padStart(2, "0")}:${new Date()
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const baseData = {
      time: timeOfUpdate
    };

    const commitUpdate = (key, updateObject) => {
      console.log(key, updateObject);
      console.log("today did not have an existing update.", this.usageData);
      if (!this.usageData[today]) {
        this.usageData = {
          ...this.usageData,
          [today]: {
            ...this.usageData[today],
            [key]: [updateObject]
          }
        };
      } else {
        console.log("today had an existing update.", this.usageData[today]);
        this.usageData = {
          ...this.usageData,
          [today]: {
            ...this.usageData[today],
            [key]: [...this.usageData[today][key], updateObject]
          }
        };
      }

      this.save();
    };

    switch (type) {
      case "uptime":
        if (typeof value !== "number")
          throw new TypeError("uptime value must be a number.");

        const uptimeUpdate = {
          ...baseData,
          uptime: value
        };

        commitUpdate("uptime", uptimeUpdate);
        break;

      case "structures":
        if (typeof value !== "number")
          throw new TypeError("uptime value must be a number.");

        const structureUpdate = {
          ...baseData,
          structureCount: value
        };

        commitUpdate("structures", structureUpdate);
        break;

      default:
        break;
    }
  }

  /**
   * load - load saved data from localstorage
   *
   * @returns {object} the contents of minerva's localstorage archive
   */
  load() {
    return JSON.parse(MinervaArchive.get("minerva_store"));
  }

  /**
   * @static setSession - set an item in session storage
   *
   * @param {string} key  key of item to set
   * @param {any}    item value of item to set
   *
   * @returns {undefined} undefined
   */
  static setSession(key, value) {
    if (!key || !value)
      throw new Error(
        "Minerva.setSession must be called with a key and a value."
      );

    Minerva._session.setItem(key, JSON.stringify(value));
  }

  /**
   * @static removeSession - remove a session storage item
   *
   * @param {string} key key to remove
   *
   * @returns {undefined} undefined
   */
  static removeSession(key) {
    if (!key)
      throw new Error("Minerva.removeSession must be called with a key.");

    Minerva._session.removeItem(key);
  }

  /**
   * @static getSession - retrieve an item from session storage
   *
   * @param {string} key key to get
   *
   * @returns {object} the value of the key
   */
  static getSession(key) {
    if (!key) throw new Error("Minerva.getSession must be called with a key.");

    return JSON.parse(Minerva._session.getItem(key));
  }

  /**
   * @static clearSessionStorage - clears session storage
   *
   * @returns {undefined} undefined
   */
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

  /**
   * remove - remove an item in storage
   *
   * @param {string}  key              key of item to remove, if using localstorage
   * @param {any}     item             item to remove. used only for the id of the item,
   * if using database
   * @param {boolean} [database=false] true if using database, false if using localstorage
   * @param {string}  type             when using database, the type of table to remove from
   * (user / data)
   *
   * @returns {(object|Promise)} current state of localstorage if using localstorage.
   * promise if using database
   */
  remove(key, item, database = false, type) {
    if (!key || (database && !type && !item))
      throw new Error("invalid arguments to Minerva.remove.");

    if (database)
      return new Promise((resolve, reject) => {
        this.database
          .delete(this.database.collections[type], item.id)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject({ status: "failure", message: err });
          });
      });

    Minerva._store.removeItem(key);

    return Minerva._store;
  }

  /**
   * @static clearStorage - clears localstorage
   *
   * @returns {undefined} undefined
   */
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
    if (key === undefined)
      throw new Error("MinervaArchive.get must be called with a key.");

    return JSON.parse(Minerva._store.getItem(key));
  }

  static remove(key) {
    if (key === undefined)
      throw new Error("MinervaArchive.remove must be called with a key.");

    return Minerva._store.removeItem(key);
  }

  static set(key, item) {
    if (key === undefined || item === undefined)
      throw new Error(
        "MinervaArchive.set must be called with both a key and a value."
      );

    Minerva._store.setItem(key, JSON.stringify(item));

    return Minerva._store;
  }
}
