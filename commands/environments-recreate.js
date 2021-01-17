// environments-recreate -----------------------------------------------------

// Recreate ".env.production" and ".env.development" based on the parameters
// entered on the command line.  Use "--help" to display the valid options.

// External Modules ----------------------------------------------------------

const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("$0 --DB_PASSWORD password [options]")
    .default("DB_DB", "guests")
    .default("DB_HOST", "localhost")
    .demandOption("DB_PASSWORD")
    .default("DB_USER", "guests")
    .default("OAUTH_ENABLED", "true")
    .default("PORT", "8080")
    .default("SUPERUSER_SCOPE", "superuser")
    .describe("DB_DB", "Database name")
    .describe("DB_HOST", "Database server host name")
    .describe("DB_PASSWORD", "Database password")
    .describe("DB_USER", "Database username")
    .describe("OAUTH_ENABLED", "Enforce OAuth permissions")
    .describe("PORT", "Client port number")
    .describe("SUPERUSER_SCOPE", "Magic word for superuser scope")
    .argv;
const fs = require("fs");

// Public Script -------------------------------------------------------------

const options = {
    "DB_DB": argv["DB_DB"],
    "DB_DIALECT": "postgres",
    "DB_HOST": argv["DB_HOST"],
    "DB_PASSWORD": argv["DB_PASSWORD"],
    "DB_POOL_ACQUIRE": 30000,
    "DB_POOL_IDLE": 10000,
    "DB_POOL_MAX": 5,
    "DB_POOL_MIN": 0,
    "DB_USER": argv["DB_USER"],
    "OAUTH_ENABLED": argv["OAUTH_ENABLED"],
    "PORT": argv["PORT"],
    "SUPERUSER_SCOPE": argv["SUPERUSER_SCOPE"],
    "SYNC_FORCE": false,
};

const generate = (mode, options) => {
    const filename = `.env.${mode}`;
    console.info(`Generating: ${filename}`);
    let output = `# Environment Variables for '${mode}' environment\n`;
    for (const option in options) {
        output += `${option}=${options[option]}\n`;
    }
    fs.writeFileSync(filename, output, {
        mode: 0o644
    });
}

console.info("Generating environment files");
generate("production", options);
options["OAUTH_ENABLED"] = false;
generate("development", options);
console.info("Environment file generation is complete");
