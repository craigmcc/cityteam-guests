// service-uninstall ---------------------------------------------------------

// Uninstall this application as a Windows 10 service.

// External Modules ----------------------------------------------------------

const Service = require("node-windows").Service;
const path = require("path");

// Internal Modules ----------------------------------------------------------

const SERVICE_NAME = "CityTeam-Guests";

// Public Script -------------------------------------------------------------

// Configure service instance
const SERVICE = new Service({
    abortOnError: true,
    name: SERVICE_NAME,
    script: path.resolve(".", "dist", "server.js"),
});

// Listen for relevant events
SERVICE.on("alreadyuninstalled", () => {
    console.log(`Service '${SERVICE.name}' was already uninstalled.`);
})
SERVICE.on("stop", () => {
    console.log(`Service '${SERVICE.name}' has been stopped.`);
})
SERVICE.on("uninstall", () => {
    console.log(`Service '${SERVICE.name}' uninstall complete.`);
});

// Uninstall the service
SERVICE.uninstall();
