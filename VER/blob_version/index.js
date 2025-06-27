// Basic modules we need to get things going
const fs = require("fs"); // to read and write files
const crypto = require("crypto"); // to generate a unique hash from the content

// Grab the command typed in the terminal (e.g., "add", "list", etc....)
const command = process.argv[2];
const args = process.argv.slice(3); // everything else after the command (like the patch content)

// File where all patches will be stored
const patchesPath = "./patches.json";

// Load existing patches from the file, or return an empty list if none exist yet
function loadPatches() {
  if (!fs.existsSync(patchesPath)) return [];
  const rawData = fs.readFileSync(patchesPath);
  return JSON.parse(rawData);
}

// Save updated patch list back to the file
function savePatches(patches) {
  fs.writeFileSync(patchesPath, JSON.stringify(patches, null, 2));
}

// Save the actual content (blob) in a file named after its hash
function saveBlob(content) {
  const hash = crypto.createHash("sha1").update(content).digest("hex");
  const dir = `./blobs/${hash.substring(0, 2)}`; // create a folder using the first 2 chars of the hash (like git)
  const filePath = `${dir}/${hash}.txt`;

  // If the folder doesnt exist yet, create it
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Only save the blob if it hasnt been saved before
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }

  return hash; // return the hash so we can reference the blob later
}

// Add a new patch (and automatically save the related blob)
function addPatch(content) {
  const patches = loadPatches();
  const hash = saveBlob(content);

  patches.push({
    message: content, // right now the message is also the actual content
    blob: hash,       // we store the blob reference (its hash)
    timestamp: new Date().toISOString(),
  });

  savePatches(patches);
  console.log(`Patch added! Blob saved as ${hash}`);
}

// Show all saved patches with details
function listPatches() {
  const patches = loadPatches();
  if (patches.length === 0) {
    console.log("No patches saved yet.");
  } else {
    console.log("Patch list:");
    patches.forEach((p, i) => {
      console.log(`${i + 1}. ${p.message} (${p.timestamp}) [${p.blob}]`);
    });
  }
}

// Remove a patch by its number in the list
function removePatch(indexStr) {
  const index = parseInt(indexStr) - 1;
  const patches = loadPatches();

  if (isNaN(index) || index < 0 || index >= patches.length) {
    console.log("Invalid index. Try a number that exists in the list.");
  } else {
    const removed = patches.splice(index, 1);
    savePatches(patches);
    console.log(`Patch removed: "${removed[0].message}"`);
  }
}

// Clear everything (like a reset button)
function clearPatches() {
  savePatches([]);
  console.log("All patches have been deleted.");
}

// Just display the patch messages like a sneak peek
function previewPatches() {
  const patches = loadPatches();
  console.log("Preview (patch messages):");
  patches.forEach((p) => {
    console.log(`- ${p.message}`);
  });
}

// Snapshot same as preview for now, but might evolve later
function snapshotPatches() {
  const patches = loadPatches();
  console.log("Snapshot (patch messages):");
  patches.forEach((p) => {
    console.log(`- ${p.message}`);
  });
}

// Decide what to do based on the command typed
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
  case "preview":
    previewPatches();
    break;
  case "snapshot":
    snapshotPatches();
    break;
  default:
    console.log("Unknown command. Try using: 'add', 'list', 'remove', 'clear', 'preview', or 'snapshot'.");
}

