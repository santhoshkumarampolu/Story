import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function createEmailVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  });
}
