// methods that are only for use by the system and privileged users.
const MinervaMethods = {};

// methods that are for use by anyone, including regular users.
const UserMethods = {};

export const parseCommand = (command, setLog, minerva) => {
  const username = minerva.user.name;

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
