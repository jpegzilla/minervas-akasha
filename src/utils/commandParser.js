import { uuidv4 } from "./../utils/misc";

const validTypes = ["shard", "node", "grimoire", "athenaeum", "hypostasis"];

// methods that are only for use by the system and privileged users.
const MinervaMethods = {};

// methods that are for use by anyone, including regular users.
const UserMethods = {
  addStructure(type, setWindows, minerva) {
    if (type === type.toLowerCase())
      throw new Error("invalid type provided to addStructure");
    // add new window to list
    const ath = {
      title: "datastructure",
      state: "restored",
      stringType: "Window",
      component: "DataStructure",
      componentProps: {
        type,
        structId: uuidv4()
      },
      belongsTo: minerva.user.id,
      id: uuidv4(),
      position: {
        x: 100,
        y: 100
      }
    };

    minerva.setWindows([...minerva.windows, ath]);

    setWindows([...minerva.windows]);

    console.log(minerva, type);
  }
};

export const parseCommand = (command, setWindows, minerva) => {
  const username = minerva.user.name;

  if (command.startsWith("add")) {
    const params = command.split(" ");
    params.splice(0, 1);

    if (!validTypes.includes(params[0]))
      return {
        state: "error",
        message:
          "invalid parameter passed to add. first parameter must be a structure type."
      };

    UserMethods.addStructure(
      params[0][0].toUpperCase() + params[0].slice(1),
      setWindows,
      minerva
    );

    return `added new ${params[0]}.`;
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
