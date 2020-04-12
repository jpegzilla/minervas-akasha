import { uuidv4 } from "./../misc";
import { Structure } from "./structure";
// import { Shard } from "./shard";
// import { Grimoire } from "./grimoire";
// import { Node } from "./node";
// import { Hypostasis } from "./hypostasis";
// import { Athenaeum } from "./athenaeum";
import { Minerva } from "./../managers/MinervaInstance";
import { validateUUIDv4 } from "./../../utils/misc";
import DatabaseInterface from "./../managers/Database";

import StructureMap from "./../managers/StructureMap";

// the master structure, meant to represent a user's entire record library when working
// within the tool. bound to user id and is created for every new user.

/**
 * AkashicRecord - a record that contains all of a user's data structures.
 * controls / maintains all data.
 * @constructor
 * @struct
 */
export default class AkashicRecord {
  constructor(userId, dateCreated, id, name, records, database) {
    if (!database instanceof DatabaseInterface)
      throw new TypeError(
        "database passed to AkashicRecord must be an instance of DatabaseInterface."
      );

    this.boundTo = userId;
    this.dateCreated = dateCreated || new Date().toISOString();
    this.id = id || uuidv4();
    this.name = name;
    this.database = database;
    this.lastUpdate = new Date().toISOString();

    // contains all of the data structures in an akashic record.
    this.records = records || {
      hypostasis: [],
      athenaeum: [],
      grimoire: [],
      node: [],
      shard: []
    };
  }

  // for keeping track of the last time the record was updated.
  // can be useful for certain functionality, but may also be
  // interesting to a user.
  updateDate() {
    this.lastUpdate = new Date().toISOString();
  }

  // mainly for development purposes. empties all records.
  resetRecords(minerva) {
    // just needs id, type, minerva
    Object.entries(this.records).forEach(([k, v]) => {
      const type = k;

      v.forEach(item => {
        this.removeFromRecord(item.id, type, minerva);
      });
    });

    this.records = {
      hypostasis: [],
      athenaeum: [],
      grimoire: [],
      node: [],
      shard: []
    };

    this.updateDate();
  }

  setBoundTo(userId) {
    this.boundTo = userId;

    this.updateDate();
    return this;
  }

  // how should I handle storing data structures in the record? should I store ids
  // and just retrieve the corresponding data structures from another store that
  // contains the actual objects? should I store the structures
  // in the records object?

  /**
   * addToRecord - add a new structure to the record
   *
   * @param {string}    id        unique id for the class
   * @param {Structure} structure instance of a structure to be added
   * @param {Minerva}   minerva   current instance of minerva
   *
   * @returns {object} instance of akashicrecord
   */
  addToRecord(id, structure, minerva) {
    if (!structure instanceof Structure)
      throw new TypeError(`${structure} is not a proper structure.`);

    const {
      type,
      tags,
      name,
      connectedTo,
      data,
      colorCode,
      accepts,
      belongsTo,
      createdAt,
      updatedAt,
      connectsTo
    } = structure;

    const newTypeRecords = [
      ...this.records[type],
      {
        id,
        type,
        tags,
        name,
        connectedTo,
        data,
        colorCode,
        accepts,
        belongsTo,
        createdAt,
        updatedAt,
        connectsTo
      }
    ];

    this.records = { ...this.records, [type]: newTypeRecords };

    minerva.record = this;

    this.updateDate();

    return this;
  }

  /**
   * findRecordById - find a record in akasha using a uuid
   *
   * @param {type} id Description
   *
   * @returns {type} Description
   */
  findRecordById(id) {
    if (!id || !validateUUIDv4(id))
      throw new Error(
        "invalid arguments passed to AkashicRecord.findRecordById"
      );

    const allRecs = Object.values(this.records).flat(Infinity);

    const found = allRecs.find(o => o.id === id);

    return found;
  }

  /**
   * removeRecord - remove a record from akasha
   *
   * @param {string} id       unique id for the record to remove
   * @param {string} type     type of record to be removed
   * @param {Minerva} minerva current instance of minerva
   *
   * @returns {undefined} void
   */
  removeFromRecord(id, type, minerva) {
    if (!StructureMap[type] instanceof Structure)
      throw new TypeError(`${id} is not a proper structure.`);

    // first, disconnect the record from all the records it's connected to
    minerva.disconnectFromAll(id);

    // then, remove it from its record array
    const newTypeRecords = this.records[type].filter(item => id !== item.id);

    this.records = { ...this.records, [type]: newTypeRecords };

    // remove all files from the record
    minerva.removeFileFromRecord(id).then(() => {
      minerva.record = this;
      console.log(minerva.record);
      this.updateDate();
    });
  }

  /**
   * editRecord - edit a record in the akashicrecord instance
   *
   * @param {string}    id        unique id belonging to the record
   * @param {string}    type      type of structure to be edited
   * @param {object}    data      object containing the new data for the structure
   * @param {Minerva}   minerva   current instance of minerva
   *
   * @returns {undefined} void
   */
  editInRecord(id, type, key, value, minerva) {
    if (!id || !type || !key || !value || !minerva)
      throw new SyntaxError("editRecord missing params");
    if (!StructureMap[type] instanceof Structure)
      throw new TypeError(`${id} is not a proper structure.`);

    const newTypeRecords = this.records[type].map(item => {
      if (item.id === id) {
        item[key] = value;
        item.updatedAt = new Date().toISOString();
      }

      return item;
    });

    this.records = { ...this.records, [type]: newTypeRecords };

    minerva.record = this;

    this.updateDate();

    minerva.save();

    return this;
  }

  /**
   * @static retrieveAkashicRecord - reconstruct an AkashicRecord instance from minerva's storage.
   *
   * @param {string}            userId user id to get records for.
   * @param {string}            name user name to get records for.
   * @param {DatabaseInterface} dbObject database interface, used to interact
   * with the database.
   * @param {boolean} [database=false]   used to determine whether to retrieve the record
   * info from the database or localstorage. localstorage is default.
   *
   * @returns {AkashicRecord} a new instance of an AkashicRecord.
   */
  static retrieveAkashicRecord(userId, name, dbObject, database = false) {
    if (database) {
      // retreive record for user with name from database
      console.log("retrieving record using database interface:", dbObject);
    } else {
      // retrieve from localStorage
      const user = JSON.parse(Minerva._store[name]);
      const record = JSON.parse(Minerva._store["minerva_store"]).records[
        userId
      ]; // make sure to get the record for the current user

      const { dateCreated } = user;
      const { records } = record;

      return new AkashicRecord(
        userId,
        dateCreated,
        userId,
        name,
        records,
        database
      );
    }
  }

  // currently not really used.
  // could be used if I had to manually recreate an AkashicRecord if it
  // somehow became broken.
  static setAkashicRecord(userId, dateCreated, id, name, records) {
    if (!userId || !dateCreated || !id || !name || !records)
      throw new SyntaxError(
        "setAkashicRecord requires all arguments: userId, dateCreated, id, name, records."
      );

    if (
      typeof records !== "object" ||
      [id, name, dateCreated, userId].some(e => typeof e !== "string")
    )
      throw new TypeError(
        "invalid parameter types passed to setAkashicRecord."
      );

    if (Object.values(records).some(e => !Array.isArray(e)))
      throw new TypeError("records passed to setAkashicRecord are malformed.");

    return new this(userId, dateCreated, id, name, records);
  }
}
