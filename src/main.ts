import Engine from "./engine/engine";
import { displayErrorMessage } from "./error/display-error";

async function main() {
  console.log("Starting game...");
  const container = document.getElementById('container');
  if (!container) {
    displayErrorMessage("No container element found.");
    return;
  }

  const vertexShader = document.getElementById('vertexShader')?.textContent || '';
  const fragmentShader = document.getElementById('fragmentShader')?.textContent || '';

  await Engine.run(container, vertexShader, fragmentShader);
}
main();