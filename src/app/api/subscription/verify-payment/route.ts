import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to verify payment" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "pro",
        // Reset monthly usage for new subscription
        tokenUsageThisMonth: 0,
        imageUsageThisMonth: 0,
      },
    });

    // Log the payment (you might want to create a separate table for this)
    console.log(`Payment successful for user ${session.user.id}:`, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: "₹100",
      plan: "pro",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription upgraded successfully",
      user: {
        id: updatedUser.id,
        subscriptionStatus: updatedUser.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("[VERIFY_PAYMENT] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
} 