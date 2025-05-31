export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors.map(e => e.message);

      return res.status(400).json({
        success: false,
        message: errors,
      });
    }
  };
}
