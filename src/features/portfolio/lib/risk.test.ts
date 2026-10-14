import { describe, expect, it } from "vitest";

import { computeRisk, deviationDays, type RiskInput } from "./risk";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const base: RiskInput = {
  openCritical: 0,
  openHigh: 0,
  estimatedDate: day("2026-09-10"),
  originalCommitDate: day("2026-09-10"),
  manualRisk: null,
};

describe("deviationDays", () => {
  it("cuenta días de retraso entre la fecha estimada y el compromiso original", () => {
    expect(deviationDays(day("2026-09-10"), day("2026-08-31"))).toBe(10);
  });

  it("es negativa cuando el proyecto va adelantado", () => {
    expect(deviationDays(day("2026-09-15"), day("2026-09-16"))).toBe(-1);
  });

  it("devuelve null si falta alguna fecha", () => {
    expect(deviationDays(null, day("2026-09-16"))).toBeNull();
    expect(deviationDays(day("2026-09-16"), null)).toBeNull();
  });

  it("ignora la hora y no se ve afectada por el cambio de horario", () => {
    expect(
      deviationDays(
        new Date("2026-11-03T23:59:00Z"),
        new Date("2026-10-27T00:01:00Z"),
      ),
    ).toBe(7);
  });
});

describe("computeRisk", () => {
  it("es bajo sin defectos ni desviación", () => {
    expect(computeRisk(base)).toBe("bajo");
  });

  describe("por defectos abiertos", () => {
    it("1 crítico → medio", () => {
      expect(computeRisk({ ...base, openCritical: 1 })).toBe("medio");
    });

    it("2 críticos → alto (borde exacto)", () => {
      expect(computeRisk({ ...base, openCritical: 2 })).toBe("alto");
    });

    it("1 alto → bajo; 2 altos → medio (borde exacto)", () => {
      expect(computeRisk({ ...base, openHigh: 1 })).toBe("bajo");
      expect(computeRisk({ ...base, openHigh: 2 })).toBe("medio");
    });

    it("muchos altos sin críticos no llegan a alto", () => {
      expect(computeRisk({ ...base, openHigh: 10 })).toBe("medio");
    });
  });

  describe("por desviación", () => {
    const withDeviation = (days: number): RiskInput => {
      const original = day("2026-09-01");
      return {
        ...base,
        originalCommitDate: original,
        estimatedDate: new Date(
          original.getTime() + days * 24 * 60 * 60 * 1000,
        ),
      };
    };

    it("1 día → bajo", () => {
      expect(computeRisk(withDeviation(1))).toBe("bajo");
    });

    it("exactamente 2 días → medio", () => {
      expect(computeRisk(withDeviation(2))).toBe("medio");
    });

    it("6 días → medio", () => {
      expect(computeRisk(withDeviation(6))).toBe("medio");
    });

    it("exactamente 7 días → alto", () => {
      expect(computeRisk(withDeviation(7))).toBe("alto");
    });

    it("un adelanto (desviación negativa) no sube el riesgo", () => {
      expect(computeRisk(withDeviation(-10))).toBe("bajo");
    });

    it("sin fechas cuenta como 0 días", () => {
      expect(
        computeRisk({ ...base, estimatedDate: null, originalCommitDate: null }),
      ).toBe("bajo");
    });
  });

  describe("riesgo manual", () => {
    it("tiene prioridad aunque el cálculo dé alto", () => {
      expect(
        computeRisk({ ...base, openCritical: 5, manualRisk: "bajo" }),
      ).toBe("bajo");
    });

    it("tiene prioridad aunque el cálculo dé bajo", () => {
      expect(computeRisk({ ...base, manualRisk: "alto" })).toBe("alto");
    });
  });

  describe("portafolio al 13/10/2026 (documento de contexto)", () => {
    it.each([
      ["Gateway Pagos", 4, 5, "2026-09-10", "2026-08-31", "alto"],
      ["App Móvil v2.0", 1, 3, "2026-08-25", "2026-08-22", "medio"],
      ["Deiman", 1, 0, "2026-10-30", "2026-10-30", "medio"],
      ["Portal Clientes", 0, 1, "2026-09-01", "2026-09-01", "bajo"],
      ["Módulo Reportes", 0, 0, "2026-09-15", "2026-09-16", "bajo"],
      ["APAC", 0, 0, "2026-10-12", "2026-10-12", "bajo"],
      ["Exinware", 0, 0, "2026-12-31", "2026-12-31", "bajo"],
    ] as const)(
      "%s → %s",
      (_name, critical, high, estimated, original, expected) => {
        expect(
          computeRisk({
            openCritical: critical,
            openHigh: high,
            estimatedDate: day(estimated),
            originalCommitDate: day(original),
            manualRisk: null,
          }),
        ).toBe(expected);
      },
    );
  });
});
