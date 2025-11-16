// server/server.js
const express = require("express");
const profileRoutes = require("./profileRoutes");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const COBOL_DIR = path.join(__dirname, "../cobol");
const INPUT_PATH = path.join(COBOL_DIR, "InCollege-Input.txt");
const OUTPUT_PATH = path.join(COBOL_DIR, "InCollege-Output.txt");


// Helper: run COBOL with a given sequence of inputs
async function runCobolWithInputs(lines) {
  return new Promise(async (resolve, reject) => {
    try {
      // Always create input file before running COBOL
      const inputContent = lines.join("\n") + "\n";
      await fs.writeFile(INPUT_PATH, inputContent, "utf8");

      // Remove old output file if exists
      try {
        await fs.unlink(OUTPUT_PATH);
      } catch (e) {
        // ignore if file doesn't exist
      }

      // Run COBOL binary
      execFile("./incollege", { cwd: COBOL_DIR }, async (err) => {
        if (err) {
          return reject(err);
        }

        // Now wait for output file to appear
        let attempts = 0;
        const maxAttempts = 20; // ~2 seconds max
        const waitForOutput = setInterval(async () => {
          attempts++;
          try {
            const output = await fs.readFile(OUTPUT_PATH, "utf8");
            clearInterval(waitForOutput);
            resolve(output);
          } catch (readErr) {
            if (attempts > maxAttempts) {
              clearInterval(waitForOutput);
              reject(
                new Error("COBOL did not create output file after execution")
              );
            }
          }
        }, 100); // check every 100ms
      });
    } catch (outerErr) {
      reject(outerErr);
    }
  });
}

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const script = [
    "1",          // initial menu: Log In
    username,     // username prompt
    password,     // password prompt
    "10"          // from main menu: Exit program
  ];

  try {
    const cobolOutput = await runCobolWithInputs(script);

    const success =
      cobolOutput.includes("You have successfully logged in") ||
      cobolOutput.toLowerCase().includes("successfully logged in");

    res.json({
      success,
      rawOutput: cobolOutput,
    });
  } catch (err) {
    console.error("COBOL error", err);
    res.status(500).json({ error: "Failed to run COBOL program" });
  }
});


// --- REGISTER / CREATE ACCOUNT ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const script = [
    "2",        // initial menu: Create Account
    username,   // username prompt
    password,   // password prompt
    "10"        // exit program after main menu
  ];

  try {
    const cobolOutput = await runCobolWithInputs(script);

    const success =
      cobolOutput.toLowerCase().includes("account created") ||
      cobolOutput.toLowerCase().includes("successfully created");

    res.json({
      success,
      rawOutput: cobolOutput,
    });
  } catch (err) {
    console.error("COBOL error", err);
    res.status(500).json({ error: "Failed to run COBOL program" });
  }
});
app.use("/api", profileRoutes);


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
