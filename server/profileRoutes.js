// server/profileRoutes.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const { encodeProfile, decodeProfile } = require("./profileCodec");

const router = express.Router();

// NEW: point to the cobol directory, same as INPUT/OUTPUT
const PROFILES_PATH = path.join(__dirname, "..", "cobol", "InCollege-Profiles.txt");


// tiny helper to safely read file lines
function readLinesSafe(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0); // ignore blank lines
}

// GET /api/profile/:username
router.get("/profile/:username", (req, res) => {
  const username = req.params.username;

  const lines = readLinesSafe(PROFILES_PATH);
  for (const line of lines) {
    const recordUsername = line.slice(0, 20).trim();
    if (recordUsername === username) {
      const profile = decodeProfile(line);
      return res.json(profile);
    }
  }

  // no profile yet
  return res.status(404).json({ error: "Profile not found" });
});

// PUT /api/profile/:username
router.put("/profile/:username", express.json(), (req, res) => {
  const username = req.params.username;
  const body = req.body || {};

  // build a profile object matching our JSON shape
  const profile = {
    username,
    firstName: body.firstName || "",
    lastName: body.lastName || "",
    school: body.school || "",
    major: body.major || "",
    gradYear: body.gradYear || "",
    about: body.about || "",
    experiences: body.experiences || [],
    education: body.education || [],
  };

  const record = encodeProfile(profile);

  // atomic-ish update: rewrite file and replace record for this username
  const lines = readLinesSafe(PROFILES_PATH);
  let found = false;
  const newLines = lines.map((line) => {
    const recordUsername = line.slice(0, 20).trim();
    if (recordUsername === username) {
      found = true;
      return record;
    }
    return line;
  });

  if (!found) {
    newLines.push(record);
  }

  fs.writeFileSync(PROFILES_PATH, newLines.join("\n") + "\n", "utf8");
  return res.json({ ok: true, created: !found });
});

module.exports = router;
