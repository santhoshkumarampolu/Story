import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Check if Razorpay credentials are available
const hasRazorpayCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

let razorpay: any = null;
if (hasRazorpayCredentials) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create an order" },
        { status: 401 }
      );
    }

    if (!hasRazorpayCredentials) {
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { plan, amount } = body;

    if (!plan || !amount) {
      return NextResponse.json(
        { error: "Plan and amount are required" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    // Note: Razorpay test mode only supports INR, so we convert USD to INR
    // Using approximate conversion rate (1 USD = 83 INR)
    const USD_TO_INR_RATE = 83;
    const amountInINR = Math.round(amount * USD_TO_INR_RATE);
    
    // Receipt must be max 40 chars
    const shortUserId = session.user.id.slice(-8);
    const timestamp = Date.now().toString(36); // Base36 for shorter string
    const receipt = `sub_${shortUserId}_${timestamp}`;
    
    const order = await razorpay.orders.create({
      amount: amountInINR, // Amount in paise (INR)
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: session.user.id,
        plan: plan,
        type: "subscription",
        originalAmountUSD: amount / 100, // Store original USD amount
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("[CREATE_ORDER] Error:", error);
    console.error("[CREATE_ORDER] Error details:", {
      message: error?.message,
      statusCode: error?.statusCode,
      error: error?.error,
    });
    return NextResponse.json(
      { error: error?.error?.description || error?.message || "Failed to create order" },
      { status: error?.statusCode || 500 }
    );
  }
} 