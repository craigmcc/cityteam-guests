// database-backup -----------------------------------------------------------

// Create a backup, suitable for use by database-restore.js, in a filename
// of the form "${DB_DB}-YYYYMMDD-HHHHMMSS.sql".

// External Modules ----------------------------------------------------------

const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("$0 [--DB_DB databaseName] [--DB_HOST hostname]")
    .default("DB_DB", "guests")
    .default("DB_HOST", "localhost")
    .describe("DB_DB", "Database name to be backed up from")
    .describe("DB_HOST", "Database server host name")
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
};
console.info("Options: " + JSON.stringify(options, null, 2));
const filename = options["DB_DB"] + "-" + timestamp() + ".sql";
console.info(`Backing up database ${options["DB_DB"]} to ${filename}`);

// TODO - the backup process

// TODO:  pg_dump --host=DB_HOST DB_DB > filename

