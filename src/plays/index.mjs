import plays from "./plays.json" with { type: "json" };
import invoices from "./invoices.json" with { type: "json" };
import { statement, htmlStatement } from "./statement.mjs";

const formattedStatement = statement(invoices[0], plays);
console.log(formattedStatement);

const html = htmlStatement(invoices[0], plays);
console.log(html);