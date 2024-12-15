import { createRouter } from "@/lib/create-app";

import { depositBalanceHandler, depositBalanceRoute } from "./routes/deposit-balance";
import { sendBalanceHandler, sendBalanceRoute } from "./routes/send-balance";
import { withdrawBalanceHandler, withdrawBalanceRoute } from "./routes/withdraw-balance";

export const balanceRouter = createRouter()
    .openapi(depositBalanceRoute, depositBalanceHandler)
    .openapi(withdrawBalanceRoute, withdrawBalanceHandler)
    .openapi(sendBalanceRoute, sendBalanceHandler);
