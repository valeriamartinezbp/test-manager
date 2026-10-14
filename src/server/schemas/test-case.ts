import { z } from "zod";

/** Paso de un caso de prueba; se guarda en TestCase.steps (JSON). */
export const testCaseStepSchema = z.object({
  action: z.string().trim().min(1, "La acción es obligatoria"),
  expectedResult: z
    .string()
    .trim()
    .min(1, "El resultado esperado es obligatorio"),
});

export const testCaseStepsSchema = z
  .array(testCaseStepSchema)
  .min(1, "El caso necesita al menos un paso");

export type TestCaseStep = z.infer<typeof testCaseStepSchema>;
