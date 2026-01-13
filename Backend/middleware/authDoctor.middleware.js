import jwt from "jsonwebtoken";

export const verifyDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        error: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach doctor info to request
    req.doctor = {
      id: decoded.doctorId,
      email: decoded.email,
    };

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
