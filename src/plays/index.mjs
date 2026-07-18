import plays from "./plays.json" with { type: "json" };
import invoices from "./invoices.json" with { type: "json" };
import { statement } from "./billing.mjs";

const formattedStatement = statement(invoices[0], plays);
console.log(formattedStatement);
