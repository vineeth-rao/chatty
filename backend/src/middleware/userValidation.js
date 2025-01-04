export const newUserValidation = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // Check if password is at least 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.log("Error in user validation middleware", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
