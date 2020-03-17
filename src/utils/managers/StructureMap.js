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

export const StructureDescriptions = {
  shard: "the smallest normal data structure.",
  grimoire: "second to largest normal structure.",
  node: "second smallest data structure.",
  hypostasis:
    "the most complex data structure, this is meant to reflect existing athenea and allow similar, but not entirely identical collections of information to exist. it also allows for information to be shared across multiple collections through modification of only one collection.",
  athenaeum:
    "an athenaeum is meant to hold large amounts of grimoires, similar to an actual athenaeum."
};
