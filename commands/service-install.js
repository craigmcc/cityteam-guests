// service-install -----------------------------------------------------------

// Install this application as a Windows 10 service, so that it starts
// automatically at boot time and stays running.

// External Modules ----------------------------------------------------------

require("custom-env").env("production");
const Service = require("node-windows").Service;
const path = require("path");

// Internal Modules ---------------------------------------------------------

const SERVICE_NAME = "CityTeam-Guests";

// Public Script ------------------------------------------------------------

// Configure environment variables we will pass to the service
const ENVIRONMENT = [
    { name: "DB_DB", value: process.env.DB_DB },
    { name: "DB_DIALECT", value: process.env.DB_DIALECT },
    { name: "DB_HOST", value: process.env.DB_HOST },
    { name: "DB_PASSWORD", value: process.env.DB_PASSWORD },
    { name: "DB_POOL_ACQUIRE", value: process.env.DB_POOL_ACQUIRE },
    { name: "DB_POOL_IDLE", value: process.env.DB_POOL_IDLE },
    { name: "DB_POOL_MAX", value: process.env.DB_POOL_MAX },
    { name: "DB_USER", value: process.env.DB_USER },
    { name: "OAUTH_ENABLED", value: process.env.OAUTH_ENABLED },
    { name: "PORT", value: process.env.PORT },
    { name: "SUPERUSER_SCOPE", value: process.env.SUPERUSER_SCOPE },
    { name: "SYNC_FORCE", value: process.env.SYNC_FORCE },
];

// Configure service instance
const SERVICE = new Service({
    abortOnError: true,
    description: "Supports checking in overnight Guests at a CityTeam Facility",
    env: ENVIRONMENT,
    name: SERVICE_NAME,
    script: path.resolve(".", "dist", "server.js"),
    workingDirectory: path.resolve("."),
});
console.info("SERVICE: ", SERVICE);

// Listen for relevant events
SERVICE.on("alreadyinstalled", () => {
    console.log(`Service '${SERVICE.name}' was already installed.`);
});
SERVICE.on("install", () => {
    console.log(`Service '${SERVICE.name}' installed in working directory '${SERVICE.workingDirectory}`);
    SERVICE.start();
});
SERVICE.on("invalidinstallation", () => {
    console.log(`Service '${SERVICE.name}' installation aborted, invalid service data detected.`);
});
SERVICE.on("start", () => {
    console.log(`Service '${SERVICE.name}' started in working directory '${SERVICE.workingDirectory}`);
    SERVICE.start();
});

// Install and start the service (start occurs in "install" event listener)
SERVICE.install();
