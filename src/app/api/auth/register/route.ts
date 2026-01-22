import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";
import { createEmailVerificationToken } from "@/lib/verification";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // User exists but email not verified - resend verification
      try {
        const verificationToken = await createEmailVerificationToken(email);
        await sendVerificationEmail({ 
          email, 
          token: verificationToken.token, 
          name: existingUser.name 
        });

        return NextResponse.json(
          { 
            message: "Account already exists but is not verified. A new verification link has been sent to your email.",
            requiresVerification: true
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error("[Register] Email sending failed:", emailError);
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again later." },
          { status: 500 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Send verification email
    try {
      const verificationToken = await createEmailVerificationToken(email);
      await sendVerificationEmail({ 
        email, 
        token: verificationToken.token, 
        name 
      });
    } catch (emailError) {
      console.error("[Register] Email sending failed for new user:", emailError);
      // User is created but email wasn't sent - this is a partial failure
      return NextResponse.json(
        { 
          error: "Account created but verification email could not be sent. Please contact support.",
          userId: user.id
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Account created successfully. Please check your email to verify your account before signing in.",
        userId: user.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error",
          details: error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Database errors
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
} 