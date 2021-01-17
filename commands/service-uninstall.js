// service-uninstall ---------------------------------------------------------

// Uninstall this application as a Windows 10 service.

// External Modules ----------------------------------------------------------

const Service = require("node-windows").Service;
const path = require("path");

// Internal Modules ----------------------------------------------------------

const SCRIPT = path.resolve(".", "dist", "server.js");
const SERVICE_NAME = "CityTeam-Guests";

// Public Script -------------------------------------------------------------

// Configure service instance
const SERVICE = new Service({
    abortOnError: true,
    name: SERVICE_NAME,
    script: SCRIPT,
});

console.log(`Uninstalling service ${SERVICE_NAME} for script ${SCRIPT}`);

// Listen for relevant events
SERVICE.on("alreadyuninstalled", () => {
    console.log(`Service '${SERVICE_NAME}' was already uninstalled.`);
})
SERVICE.on("stop", () => {
    console.log(`Service '${SERVICE_NAME}' has been stopped.`);
})
SERVICE.on("uninstall", () => {
    console.log(`Service '${SERVICE_NAME}' uninstall complete.`);
});

// Uninstall the service
SERVICE.uninstall();
