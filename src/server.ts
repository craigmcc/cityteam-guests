// server --------------------------------------------------------------------

// Overall Express server for the CityTeam Guest Checkins application.

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
import { Orchestrator } from "@craigmcc/oauth-orchestrator";

// Internal Modules ----------------------------------------------------------

import logger from "./util/logger";

import Database from "./models/Database";
import ExpressApplication from "./routers/ExpressApplication";
import OAuthOrchestratorHandlers from "./oauth/OAuthOrchestratorHandlers";
export const OAuthOrchestrator: Orchestrator
    = new Orchestrator(OAuthOrchestratorHandlers);

// Configuration Processing --------------------------------------------------

// Configure Database and Synchronization

logger.info({
    context: "Startup",
    msg: `Initialize Sequelize Models, dialect=${Database.getDialect()}`
});

let force: boolean = false;
if (process.env.SYNC_FORCE) {
    force = (process.env.SYNC_FORCE === "true");
}
logger.info({
    context: "Startup",
    msg: `Synchronize Database Models, force=${force}`
});
Database.sync({
    force: force
});

// Configure and Start Server ------------------------------------------------

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
ExpressApplication.listen(port, () => {
    logger.info({
        context: "Startup",
        msg: `Start Server, mode=${process.env.NODE_ENV}, port=${port}`
        }
    )
});
