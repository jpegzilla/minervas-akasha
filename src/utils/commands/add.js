import { UserMethods } from "./methods";

const validTypes = ["shard", "node", "grimoire", "athenaeum", "hypostasis"];

export default (command, minerva, setWindows) => {
  const params = command.split(" ");
  params.splice(0, 1);

  // get the name of the structure as well as the type
  const [type, name] = [params[0], params.slice(1).join(" ")];

  if (!validTypes.includes(type))
    return {
      state: "error",
      message:
        "invalid parameter passed to add. first parameter must be a structure type."
    };

  UserMethods.addStructure(type, name, setWindows, minerva);

  return `added new ${type}${name ? ` "${name}"` : ""}.`;
};
