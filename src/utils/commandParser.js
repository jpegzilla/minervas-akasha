import { uuidv4 } from "./../utils/misc";
import { makeStruct } from "./../utils/managers/StructureMap";

const validTypes = ["shard", "node", "grimoire", "athenaeum", "hypostasis"];
let awaitingAnswer = false;

const { REACT_APP_MINERVA_ADMIN_KEY: ADMIN_KEY } = process.env;

// methods that are only for use by the system and privileged users.
const MinervaMethods = {
  verifyUser(key) {
    awaitingAnswer = !awaitingAnswer;

    if (awaitingAnswer)
      return { state: "password", message: "enter admin key" };
    else if (key) {
      console.log(ADMIN_KEY, key);
      awaitingAnswer = !awaitingAnswer;
      return "yes" === key
        ? {
            state: "update",
            message: "resetting record",
            action: "reset records"
          }
        : { state: "error", message: "invalid key provided." };
    }
  }
};

// methods that are for use by anyone, including regular users.
const UserMethods = {
  addStructure(type, setWindows, minerva) {
    // add new window to list
    const struct = makeStruct(type, uuidv4(), minerva, uuidv4);

    minerva.setWindows([...minerva.windows, struct]);

    setWindows([...minerva.windows]);

    console.log(minerva, type);
  }
};

export const parseCommand = (command, setWindows, minerva) => {
  const username = minerva.user.name;

  if (!awaitingAnswer && command.toLowerCase() !== command) {
    return {
      state: "error",
      message: "no uppercase letters allowed."
    };
  }

  if (command.startsWith("add")) {
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
  }

  if (
    ["reset records", "reset record"].includes(command) &&
    awaitingAnswer === false
  ) {
    const stepOne = MinervaMethods.verifyUser();

    return stepOne;
  }

  if (awaitingAnswer === true) {
    return MinervaMethods.verifyUser(command);
  }

  switch (command) {
    case "hello":
      return "hello to you too!";
    case username:
      return "that's your name!";
    case "minerva":
      return "that's my name!";
    default:
      return false;
  }
};
