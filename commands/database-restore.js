// database-restore ----------------------------------------------------------

// Restore a previously backed up database

// Create a backup, suitable for use by database-restore, from a filename
// of the form "${DB_DB}-YYYYMMDD-HHHHMMSS.sql".

// NOTE:  The database name, and associated username and password,
// are baked into the backup file and cannot be changed.  TODO - fix this?

// External Modules ----------------------------------------------------------

const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("$0 [--DB_DB databaseName] [--DB_HOST hostname] --FILENAME filename")
    .default("DB_DB", "guests")
    .default("DB_HOST", "localhost")
    .describe("DB_DB", "Database name to be restored into")
    .describe("DB_HOST", "Database server host name")
    .describe("FILENAME", "Filename from which to restore this database")
    .argv;


// Public Script -------------------------------------------------------------

const options = {
    "DB_DB": argv["DB_DB"],
    "DB_HOST": argv["DB_HOST"],
    "FILENAME": argv["FILENAME"],
};
console.info("Options: " + JSON.stringify(options, null, 2));

// TODO - the restore process

// TODO: psql --host=DB_HOST DB_DB < whatever-YYYYMMDD-HHMMSS.sql
