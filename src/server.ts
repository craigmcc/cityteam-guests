// server --------------------------------------------------------------------

// Overall Express server for the CityTeam Guest Checkins application.

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
import { Orchestrator } from "@craigmcc/oauth-orchestrator";

// Internal Modules ----------------------------------------------------------

import OAuthOrchestratorHandlers from "./oauth/OAuthOrchestratorHandlers";
export const OAuthOrchestrator: Orchestrator
    = new Orchestrator(OAuthOrchestratorHandlers);

// Configuration Processing --------------------------------------------------

