import Engine from "./engine/engine";
import { displayErrorMessage } from "./error/display-error";

async function main() {
  console.log("Starting game...");
  const container = document.getElementById('container');
  if (!container) {
    displayErrorMessage("No container element found.");
    return;
  }

  await Engine.run({ container });
}
main();