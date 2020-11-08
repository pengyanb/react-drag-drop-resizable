const { promises: fs } = require("fs");

const patchVersionNumber = async () => {
  if (process.argv.length < 4) {
    return console.log("Version not specified. Task skipped.");
  }
  try {
    const version = process.argv[2];
    const packageJsonPath = process.argv[3];

    const packageJson = JSON.parse(
      (await fs.readFile(packageJsonPath)).toString()
    );

    packageJson.version = version;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Successfully set package.json version to ${version}`);
  } catch (err) {
    console.error(err);
  }
};

patchVersionNumber();
