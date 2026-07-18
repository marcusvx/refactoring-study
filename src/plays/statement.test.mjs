import { describe, expect, test } from "vitest";
import { statement } from "./statement.mjs";

const PLAYS = {
  play1: {
    name: "Play 1",
    type: "tragedy",
  },
  play2: {
    name: "Play 2",
    type: "comedy",
  },
  play3: {
    name: "Play 3",
    type: "tragedy",
  },
};

function buildInvoice(performances, customer = "Test Customer") {
  return { customer, performances };
}

describe("statement", () => {
  test("returns expected string successfully", () => {
    const invoice = buildInvoice(
      [
        { playID: "play1", audience: 60 },
        { playID: "play2", audience: 38 },
        { playID: "play3", audience: 42 },
      ],
      "Customer Name 1",
    );

    const result = statement(invoice, PLAYS);

    expect(result).toContain("Statement for Customer Name 1");
    expect(result).toContain("Play 1: $700.00 (60 seats)");
    expect(result).toContain("Play 2: $604.00 (38 seats)");
    expect(result).toContain("Play 3: $520.00 (42 seats)");
    expect(result).toContain("Amount owned is $1,824.00");
    expect(result).toContain("You earned 57");
  });

  test("includes the customer name in the header", () => {
    const invoice = buildInvoice([], "Alice");

    const result = statement(invoice, PLAYS);

    expect(result).toContain("Statement for Alice");
  });

  test("returns zero totals for an invoice with no performances", () => {
    const expected = `Statement for Test Customer
Amount owned is $0.00
You earned 0
`;

    const result = statement(buildInvoice([]), PLAYS);

    expect(result).toBe(expected);
  });

  describe("tragedy pricing", () => {
    test("charges the base amount when audience is at most 30", () => {
      const invoice = buildInvoice([{ playID: "play1", audience: 30 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("Play 1: $400.00 (30 seats)");
      expect(result).toContain("Amount owned is $400.00");
    });

    test("charges $10.00 extra per attendee above 30", () => {
      const invoice = buildInvoice([{ playID: "play1", audience: 31 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("Play 1: $410.00 (31 seats)");
      expect(result).toContain("Amount owned is $410.00");
    });
  });

  describe("comedy pricing", () => {
    test("charges base amount plus $3.00 per attendee when audience is at most 20", () => {
      const invoice = buildInvoice([{ playID: "play2", audience: 20 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("Play 2: $360.00 (20 seats)");
      expect(result).toContain("Amount owned is $360.00");
    });

    test("adds the large-audience surcharge above 20 attendees", () => {
      const invoice = buildInvoice([{ playID: "play2", audience: 21 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("Play 2: $468.00 (21 seats)");
      expect(result).toContain("Amount owned is $468.00");
    });
  });

  describe("volume credits", () => {
    test("awards no credits when audience is at most 30", () => {
      const invoice = buildInvoice([{ playID: "play1", audience: 30 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("You earned 0");
    });

    test("awards one credit per attendee above 30", () => {
      const invoice = buildInvoice([{ playID: "play1", audience: 35 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("You earned 5");
    });

    test("awards an extra credit per five comedy attendees", () => {
      const invoice = buildInvoice([{ playID: "play2", audience: 20 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("You earned 4");
    });

    test("combines the audience and comedy credits", () => {
      const invoice = buildInvoice([{ playID: "play2", audience: 35 }]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("You earned 12");
    });

    test("accumulates credits across performances", () => {
      const invoice = buildInvoice([
        { playID: "play1", audience: 40 },
        { playID: "play2", audience: 25 },
      ]);

      const result = statement(invoice, PLAYS);

      expect(result).toContain("You earned 15");
    });
  });

  test("formats amounts with thousands separators", () => {
    const invoice = buildInvoice([{ playID: "play1", audience: 100 }]);

    const result = statement(invoice, PLAYS);

    expect(result).toContain("Play 1: $1,100.00 (100 seats)");
    expect(result).toContain("Amount owned is $1,100.00");
  });

  test("throws for an unknown play type", () => {
    const plays = { play1: { name: "Play 1", type: "opera" } };
    const invoice = buildInvoice([{ playID: "play1", audience: 10 }]);

    expect(() => statement(invoice, plays)).toThrow("unknown type: opera");
  });
});
