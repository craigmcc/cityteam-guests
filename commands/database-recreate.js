// database-recreate ---------------------------------------------------------

// Delete and recreate the CityTeam Guests database based on the parameters
// entered on the command line.  Use "--help" to display the valid parameters.

// WARNING:  THIS COMMAND WILL ERASE ANY EXISTING DATABASE WITH THIS NAME!
// BE SURE YOU HAVE A CURRENT BACKUP BEFORE PROCEEDING, OR CREATE A NEW
// DATABASE WITH A DIFFERENT NAME USING THE "--DB_DB {name}" PARAMETER.

// External Modules ----------------------------------------------------------

const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("$0 --DB_DB databaseName --DB_PASSWORD databasePassword [options]")
    .demandOption("DB_DB")
    .default("DB_HOST", "localhost")
    .demandOption("DB_PASSWORD")
    .default("DB_USER", "guests")
    .describe("DB_DB", "Database name to delete and recreate")
    .describe("DB_HOST", "Database server host name")
    .describe("DB_PASSWORD", "Database password to install")
    .describe("DB_USER", "Database username to install")
    .epilogue("BE SURE YOU HAVE A CURRENT BACKUP BEFORE RECREATING AN EXISTING DATABASE!")
    .argv;
const { execSync } = require("child_process");
const { Readable } = require("stream");

// Public Script -------------------------------------------------------------

const options = {
    "DB_DB": argv["DB_DB"],
    "DB_HOST": argv["DB_HOST"],
    "DB_PASSWORD": argv["DB_PASSWORD"],
    "DB_USER": argv["DB_USER"],
};
console.info("Options: " + JSON.stringify(options, null, 2));

const script = "-- Drop Roles (may fail the first time\n"
    + `DROP ROLE IF EXISTS ${options["DB_DB"]}_all;\n`
    + `DROP ROLE IF EXISTS ${options["DB_DB"]};\n`
    + "-- Recreate Database\n"
    + `DROP DATABASE IF EXISTS ${options["DB_DB"]};\n`
    + `CREATE DATABASE ${options["DB_DB"]}\n`
    + "  CONNECTION LIMIT = -1 ENCODING = 'UTF-8'\n"
    + "  LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8'\n"
    + "  OWNER = postgres TABLESPACE = pg_default;\n"
    + "-- Recreate Roles\n"
    + `CREATE ROLE ${options["DB_USER"]};\n`
    + `ALTER ROLE ${options["DB_USER"]}\n`
    + "  INHERIT LOGIN NOCREATEDB NOCREATEROLE NOSUPERUSER\n"
    + `  PASSWORD '${options["DB_PASSWORD"]}' REPLICATION;\n`
    + `CREATE ROLE ${options["DB_USER"]}_all;\n`
    + `ALTER ROLE ${options["DB_USER"]}_all\n`
    + "  INHERIT NOBYPASSRLS NOCREATEROLE NOLOGIN NOREPLICATION NOSUPERUSER;\n"
    + `GRANT ${options["DB_USER"]}_all TO ${options["DB_USER"]};\n`
const stream = Readable.from(script);

console.info(`Recreating database '${options["DB_DB"]}'`
    + ` and associated roles for user '${options["DB_USER"]}'`);
const command = `psql -U postgres --host=${options["DB_HOST"]}`
try {
    console.info(execSync(command, {
        input: script
    }).toString());
    console.info("Recreating database is complete");
} catch (error) {
    console.info("Error Message: " + error.message);
    console.info("Error Content: " + error.stderr.toString());
}
