import { z } from 'zod';
import type { ClientData } from '../store/useStore';

// Strict numeric schema with default fallbacks to prevent NaN cascading
const safeNumber = z
  .number()
  .min(0, "Cannot be negative")
  .default(0)
  .catch(0);

// Schema matches the ClientData interface exactly
export const clientDataSchema = z.object({
  clientName: z.string().default("").catch(""),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(99, "Age must be under 100")
    .default(30)
    .catch(30),
  targetAge: z
    .number()
    .min(50, "Target age must be at least 50")
    .max(99, "Target age must be under 100")
    .default(65)
    .catch(65),
  monthlyIncome: safeNumber,
  monthlyExpenses: safeNumber,
  cash: safeNumber,
  cpfOA: safeNumber,
  totalDebt: safeNumber,
  dependentReliefs: safeNumber,
});

export type ValidatedClientData = z.infer<typeof clientDataSchema>;

// Helper to safely parse partial updates
export const parsePartialClientData = (data: Partial<ClientData>): Partial<ClientData> => {
  const result: Partial<ClientData> = {};
  for (const key of Object.keys(data) as Array<keyof ClientData>) {
    const fieldSchema = clientDataSchema.shape[key];
    if (fieldSchema) {
      const parsed = fieldSchema.safeParse(data[key]);
      if (parsed.success) {
        // @ts-ignore
        result[key] = parsed.data;
      }
    }
  }
  return result;
};
