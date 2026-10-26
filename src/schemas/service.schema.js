import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string({ error: "El nombre del servicio es obligatorio" })
    .trim()
    .min(1, "El nombre del servicio es obligatorio"),
  description: z
    .string({ error: "La descripción del servicio es obligatoria" })
    .trim()
    .min(1, "La descripción del servicio es obligatoria"),
  duration: z
    .number({ error: "La duración del servicio debe ser un número" })
    .int("La duración debe ser un número entero de minutos")
    .min(1, "La duración debe ser de al menos 1 minuto"),
  price: z
    .number({ error: "El precio del servicio debe ser un número" })
    .min(0, "El precio no puede ser negativo"),
  category: z
    .string({ error: "La categoría del servicio es obligatoria" })
    .trim()
    .min(1, "La categoría del servicio es obligatoria"),
  available: z.boolean({
    error: "La disponibilidad debe ser verdadero o falso",
  }),
});

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "Debes enviar al menos un campo para actualizar",
  });

export const getServicesQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "La categoría no puede estar vacía")
    .optional(),
  available: z
    .enum(["true", "false"], {
      error: "La disponibilidad debe ser 'true' o 'false'",
    })
    .optional(),
  page: z.coerce
    .number({ error: "La página debe ser un número" })
    .int("La página debe ser un número entero")
    .min(1, "El número de página debe ser al menos 1")
    .optional(),
  limit: z.coerce
    .number({ error: "El límite debe ser un número" })
    .int("El límite debe ser un número entero")
    .min(1, "El límite de resultados debe ser al menos 1")
    .max(100, "El límite máximo es 100 resultados por página")
    .optional(),
  sortBy: z
    .enum(["name", "price", "duration", "category"], {
      error: "sortBy debe ser 'name', 'price', 'duration' o 'category'",
    })
    .optional(),
  order: z
    .enum(["asc", "desc"], { error: "order debe ser 'asc' o 'desc'" })
    .optional(),
});
