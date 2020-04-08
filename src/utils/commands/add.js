import { UserMethods } from "./methods";

const validTypes = ["shard", "node", "grimoire", "athenaeum", "hypostasis"];

export default (command, minerva, setWindows) => {
  const params = command.split(" ");
  params.splice(0, 1);

  if (!validTypes.includes(params[0]))
    return {
      state: "error",
      message:
        "invalid parameter passed to add. first parameter must be a structure type."
    };

  UserMethods.addStructure(params[0], setWindows, minerva);

  return `added new ${params[0]}.`;
};
