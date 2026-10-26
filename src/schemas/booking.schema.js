import { z } from "zod";

const objectIdSchema = z
  .string({ error: "El ID es obligatorio" })
  .regex(/^[0-9a-fA-F]{24}$/, "El ID debe ser un ObjectId válido");

export const createBookingSchema = z.object({
  clientName: z
    .string({ error: "El nombre del cliente es obligatorio" })
    .trim()
    .min(1, "El nombre del cliente es obligatorio"),
  clientEmail: z.email("El correo electrónico del cliente no es válido"),
  date: z
    .string({ error: "La fecha es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD")
    .refine(
      (value) => new Date(`${value}T00:00:00Z`).toISOString().startsWith(value),
      "La fecha no es una fecha real del calendario",
    ),
  time: z
    .string({ error: "La hora es obligatoria" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener el formato HH:mm"),
  status: z.enum(["Agendado", "Confirmado", "Cancelado"], {
    error: "El estado debe ser 'Agendado', 'Confirmado' o 'Cancelado'",
  }),
  services: z
    .array(
      z.object({
        service: objectIdSchema,
        quantity: z
          .number({ error: "La cantidad debe ser un número" })
          .int("La cantidad debe ser un número entero")
          .min(1, "La cantidad debe ser al menos 1")
          .default(1),
      }),
    )
    .optional(),
});

export const addServiceToBookingParamsSchema = z.object({
  bid: objectIdSchema,
  sid: objectIdSchema,
});
