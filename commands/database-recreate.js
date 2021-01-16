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
    .describe("DB_USER", "Databsea username to install")
    .epilogue("BE SURE YOU HAVE A CURRENT BACKUP BEFORE RECREATING AN EXISTING DATABASE!")
    .argv;

// Public Script -------------------------------------------------------------

const options = {
    "DB_DB": argv["DB_DB"],
    "DB_HOST": argv["DB_HOST"],
    "DB_PASSWORD": argv["DB_PASSWORD"],
    "DB_USER": argv["DB_USER"],
};
console.info("Options: " + JSON.stringify(options, null, 2));

/*
-- Drop Roles (may fail the first time) --------------------------------------

DROP ROLE IF EXISTS guests_all;
DROP ROLE IF EXISTS guests;

-- Recreate Database ---------------------------------------------------------

DROP DATABASE IF EXISTS guests;

CREATE DATABASE guests WITH
    CONNECTION LIMIT = -1
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    OWNER = postgres
    TABLESPACE = pg_default
;

COMMENT ON DATABASE guests IS 'CityTeam Guests Database';

-- Recreate Roles ------------------------------------------------------------

CREATE ROLE guests;
ALTER ROLE guests WITH
    INHERIT
    LOGIN
    NOCREATEDB
    NOCREATEROLE
    NOSUPERUSER
    PASSWORD '*REDACTED*'
    REPLICATION
    ;
COMMENT ON ROLE guests IS 'CityTeam Guests application user';

CREATE ROLE guests_all;
ALTER ROLE guests_all WITH
    INHERIT
    NOBYPASSRLS
    NOCREATEROLE
    NOLOGIN
    NOREPLICATION
    NOSUPERUSER
    ;
COMMENT ON ROLE guests_all IS 'All Access to CityTeam Guests database';

GRANT guests_all TO guests;
*/
