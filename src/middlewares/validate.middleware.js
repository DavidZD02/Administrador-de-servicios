export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => {
          const field = issue.path.join(".");
          return field ? `${field}: ${issue.message}` : issue.message;
        })
        .join(", ");

      return res.status(400).json({ status: "error", message: messages });
    }

    if (source !== "query") {
      req[source] = result.data;
    }

    next();
  };
