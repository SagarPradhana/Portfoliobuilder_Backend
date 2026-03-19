import bcrypt from "bcryptjs";
import { signToken } from "../utils/token.js";
import { createUser, findUserByEmail } from "../utils/fileDb.js";

const authPayload = (user) => ({
  token: signToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email
  }
});

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });
  return res.status(201).json(authPayload(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json(authPayload(user));
};

export const getMe = async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
};
