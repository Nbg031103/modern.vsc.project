// I imported the 'fs' module from Node.js because it's what allows us to read and write files in the system.
// Everything we save as patches will go into a simple JSON file
const fs = require("fs");

// Grabbing the first argument after "node index.js", like "add", "list", etc...
// This will basically define what the tool is going to do
const command = process.argv[2];

// The rest of the arguments, like the patch description (e.g., "fix bug"), go here
const args = process.argv.slice(3);

// Here I defined where the system will store the patch info
// I decided to keep everything in a file called patches.json at the root of the folder
const filePath = "./patches.json";

// Function that loads the patches from the file
// If the file doesn't exist yet, or is empty, it starts with an empty list
// This prevents errors when running the program for the first time
function loadPatches() {
  if (!fs.existsSync(filePath)) return []; // if the file doesn't exist, start with []
  const rawData = fs.readFileSync(filePath); // read the content of the file
  return JSON.parse(rawData); // convert from JSON to JS object
}

// Function that saves the updated patch list to the file
// Whenever we add, remove or clear, this gets called
function savePatches(patches) {
  fs.writeFileSync(filePath, JSON.stringify(patches, null, 2)); // save nicely formatted (indented)
}

// This function is responsible for adding a new patch to the list
// It creates an object with the message and current timestamp (to keep it traceable)
function addPatch(message) {
  const patches = loadPatches(); // load the existing ones
  patches.push({
    message,
    timestamp: new Date().toISOString(), // get current time in ISO format (pretty standard)
  });
  savePatches(patches); // save everything again
  console.log("Patch added successfully."); // just feedback for the user
}

// This function lists all patches saved so far
// I wanted it to say something if there’s nothing saved, so it doesn’t just go silent
function listPatches() {
  const patches = loadPatches();
  if (patches.length === 0) {
    console.log("No patches saved yet.");
  } else {
    console.log("Patch list:");
    patches.forEach((p, i) => {
      console.log(`${i + 1}. ${p.message} (${p.timestamp})`); // 
    });
  }
}

// Here the user can remove an individual patch, passing its number
// I converted the number to array index and did some basic checks to avoid errors
function removePatch(indexStr) {
  const index = parseInt(indexStr) - 1; // turning into array index (0-based)
  const patches = loadPatches();

  if (isNaN(index) || index < 0 || index >= patches.length) {
    console.log("Invalid index. Try a number that exists in the list.");
  } else {
    const removed = patches.splice(index, 1); // remove the patch
    savePatches(patches); // save again
    console.log(`Patch removed: "${removed[0].message}"`);
  }
}

// This function simply deletes all patches
// I thought of it as a "reset" button — useful if someone wants to start from scratch
function clearPatches() {
  savePatches([]); // save an empty list
  console.log("All patches have been deleted.");
}

// Experimental snapshot command to preview current patch content
function snapshot() {
  const patches = loadPatches();
  if (patches.length === 0) {
    console.log("No patches to preview.");
  } else {
    console.log("Snapshot (patch messages):");
    patches.forEach((p) => {
      console.log("- " + p.message);
    });
  }
}

// This is like the command center. Based on what the user types, it calls the corresponding function
// If nothing valid is typed, it shows a help message
switch (command) {
  case "add":
    addPatch(args.join(" "));
    break;
  case "list":
    listPatches();
    break;
  case "remove":
    removePatch(args[0]);
    break;
  case "clear":
    clearPatches();
    break;
  case "snapshot":
    snapshot();
    break;
  default:
    console.log("Unknown command. Try using: 'add', 'list', 'remove', 'clear', or 'snapshot'.");
}
