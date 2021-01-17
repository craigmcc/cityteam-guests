// database-backup -----------------------------------------------------------

// Create a backup, suitable for use by database-restore.js, in a filename
// of the form "${DB_DB}-YYYYMMDD-HHHHMMSS.sql".

// External Modules ----------------------------------------------------------

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("$0 [--DB_DB databaseName] [--DB_HOST hostname]")
    .default("DB_DB", "guests")
    .default("DB_HOST", "localhost")
    .default("DB_USER", "guests")
    .describe("DB_DB", "Database name to be backed up from")
    .describe("DB_HOST", "Database server host name")
    .describe("DB_USER", "Database username")
    .argv;

// Private Functions ---------------------------------------------------------

const leftPad = (input, size) => {
    let output = String(input);
    while (output.length < size) {
        output = "0" + output;
    }
    return output;
}

const timestamp = () => {
    const date = new Date();
    return date.getFullYear()
        + leftPad(date.getMonth() + 1, 2)
        + leftPad(date.getDate(), 2)
        + "-"
        + leftPad(date.getHours(), 2)
        + leftPad(date.getMinutes(), 2)
        + leftPad(date.getSeconds(), 2);

}

// Public Script -------------------------------------------------------------

const options = {
    "DB_DB": argv["DB_DB"],
    "DB_HOST": argv["DB_HOST"],
    "DB_USER": argv["DB_USER"],
};
const directoryName = "backup";
if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
}
const fileName = options["DB_DB"] + "-" + timestamp() + ".sql";
const pathName = path.resolve(directoryName, fileName);
console.info(`Backing up database ${options["DB_DB"]} to ${pathName}`);

const command
    = `pg_dump --host=${options["DB_HOST"]} -U ${options["DB_USER"]} ${options["DB_DB"]} > ${pathName}`;
console.info(execSync(command).toString());

console.info("Database backup is complete");
