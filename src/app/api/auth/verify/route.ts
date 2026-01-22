import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(`${appUrl}/auth/verify?status=error&reason=missing_params`);
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token
      }
    }
  });

  if (!verificationToken) {
    return NextResponse.redirect(`${appUrl}/auth/verify?status=error&reason=invalid_token`);
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      }
    });
    return NextResponse.redirect(`${appUrl}/auth/verify?status=error&reason=expired`);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token
      }
    }
  });

  return NextResponse.redirect(`${appUrl}/auth/verify?status=success`);
}
