export const formatZodIssues = (error) =>
  error.issues
    .map((issue) => {
      const field = issue.path.join(".");
      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join(", ");

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res
        .status(400)
        .json({ status: "error", message: formatZodIssues(result.error) });
    }

    if (source !== "query") {
      req[source] = result.data;
    }

    next();
  };
