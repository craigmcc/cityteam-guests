// server --------------------------------------------------------------------

// Overall Express server for the CityTeam Guest Checkins application.

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
import { Orchestrator } from "@craigmcc/oauth-orchestrator";

// Internal Modules ----------------------------------------------------------

import Database from "./models/Database";
import ExpressApplication from "./routers/ExpressApplication";
import OAuthOrchestratorHandlers from "./oauth/OAuthOrchestratorHandlers";
export const OAuthOrchestrator: Orchestrator
    = new Orchestrator(OAuthOrchestratorHandlers);

// Configuration Processing --------------------------------------------------

// Configure Models and Associations

console.info("Configure Sequelize Models: Starting");
console.info(`  Dialect: ${Database.getDialect()}`);
console.info("Configure Sequelize Models: Complete");

// Synchronize Database Metadata

console.info("Configure Database Metadata: Starting");
let force: boolean = false;
if (process.env.SYNC_FORCE) {
    force = (process.env.SYNC_FORCE === "true");
}
console.info(`  Sync force: ${force}`);
Database.sync({
    force: force
});
console.info("Configure Database Metadata: Complete");

// Configure and Start Server ------------------------------------------------

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
ExpressApplication.listen(port, () => {
    console.log(
        `CityTeam Guests Server in ${process.env.NODE_ENV} mode running on port ${port}`
    )
});
