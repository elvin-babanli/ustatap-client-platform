import type { User } from "@prisma/client";
import type { SafeUser } from "../interfaces";

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    isPhoneVerified: user.isPhoneVerified,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}
