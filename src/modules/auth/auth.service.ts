import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import config from "../../config/index.js";
import { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utility/jwt.js";
import { AppError } from "../../errors/AppError";
import { RegisterUserPayload } from "./auth.interface.js";

const registerUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, phone, address, avatarUrl } = payload;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  if (role && !["TENANT", "LANDLORD"].includes(role)) {
    throw new AppError("Role must be TENANT or LANDLORD", 400);
  }

  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashed = await bcryptjs.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password : hashed,
      status: "ACTIVE",
      role: (role as "TENANT" | "LANDLORD") ?? "TENANT",
      phone,
      address,
      avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (body: { email: string; password: string }) => {
  const { email, password } = body;

  if (!email || !password)
    throw new AppError("Email and password are required", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);
  if (user.status === "BANNED")
    throw new AppError("Account has been banned", 403);

  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );
  return { accessToken, refreshToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit :{
        password: true,
    }
  });
  if (!user) throw new AppError("User not found", 404);

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
};
