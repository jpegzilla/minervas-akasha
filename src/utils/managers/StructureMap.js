import { Shard } from "./../structures/shard";
import { Grimoire } from "./../structures/grimoire";
import { Node } from "./../structures/node";
import { Hypostasis } from "./../structures/hypostasis";
import { Athenaeum } from "./../structures/athenaeum";

export default {
  shard: Shard,
  grimoire: Grimoire,
  node: Node,
  hypostasis: Hypostasis,
  athenaeum: Athenaeum
};

/**
 * makeStruct - creates a data representation of a structure.
 *
 * @param {string}   type    type of structure to create
 * @param {string}   id      id of structure (structId)
 * @param {Minerva}  minerva current instance of minerva
 * @param {function} uuidv4  uuid generation function
 * @param {string}   name    name for the structure
 *
 * @returns {object} created structure
 */
export const makeStruct = (type, id, minerva, uuidv4, name = null) => {
  if (!type || !id || !minerva || !uuidv4 || typeof uuidv4 !== "function")
    throw new Error("missing arguments to makeStruct.");
  if (name !== null && typeof name !== "string")
    throw new Error("invalid name passed to makeStruct");

  const findWindowAtPosition = xy => {
    const allWindows = Object.values(minerva.windows).flat(Infinity);

    const windowToFind = allWindows.find(
      item => item.position.x === xy && item.position.y === xy
    );

    return windowToFind || false;
  };

  let finalPosition = 100;

  while (findWindowAtPosition(finalPosition)) {
    finalPosition += 10;
  }

  const structObject = {
    title: "datastructure",
    state: "restored",
    stringType: "Window",
    component: "DataStructure",
    componentProps: {
      type,
      structId: id,
      data: { notes: "", extra: {} }
    },
    belongsTo: minerva.user.id,
    id: uuidv4(),
    position: {
      x: finalPosition,
      y: finalPosition
    }
  };

  if (name) {
    structObject.componentProps.info = {
      name
    };
  } else {
    structObject.componentProps.info = { name: type };
  }

  return structObject;
};

export const StructureDescriptions = {
  shard: "the smallest normal data structure.",
  grimoire: "second to largest normal structure.",
  node: "second smallest data structure.",
  hypostasis:
    "the most complex data structure, this is meant to reflect existing athenea and allow similar, but not entirely identical collections of information to exist. it also allows for information to be shared across multiple collections through modification of only one collection.",
  athenaeum:
    "an athenaeum is meant to hold large amounts of grimoires, similar to an actual athenaeum."
};
