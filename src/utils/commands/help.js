import { commandDirectory } from "./commandList";

export default () => {
  let helpMessage = "minerva's akasha command list:\r\n";

  Object.entries(commandDirectory).forEach(([k, v], i, a) => {
    if (i !== a.length - 1) helpMessage += `  ${k}: ${v}\r\n`;
    else helpMessage += `  ${k}: ${v}`;
  });

  return helpMessage;
};
