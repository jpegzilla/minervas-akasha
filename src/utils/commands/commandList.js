export const commandDirectory = {
  "> help": "show this list.",
  "> reset records":
    "permanently remove all data structures. requires password. there is\n    no way to recover from this operation unless you exported your data beforehand.",
  "> add <type> [name]":
    "add a new structure of a certain type, with an optional name.\n    acceptable structure types:\r\n\tshard\t\tnode\t\tgrimoire\r\n\tathenaeum\thypostasis",
  "> find [--type <structure type>] [--mime <mime type>] [query]":
    "find a structure\n    using a search string, optionally using a mime type and / or structure type.\n    example: find music --type shard --mime audio/wav"
};
