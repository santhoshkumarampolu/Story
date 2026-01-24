import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upgradeUserSubscription, SUBSCRIPTION_PLANS } from "@/lib/subscription";
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

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

    // Validate plan ID
    const validPlans = ['hobby_monthly', 'hobby_yearly', 'pro_monthly', 'pro_yearly'];
    const planId = validPlans.includes(plan) ? plan : 'pro_monthly';
    
    // Get plan details for amount
    const planDetails = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    const amount = Math.round(planDetails.price * 100); // in cents (USD)

    // Upgrade user using the subscription library
    const result = await upgradeUserSubscription(
      session.user.id, 
      planId as 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly', 
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: amount,
      }
    );

    console.log(`[PAYMENT] Successful upgrade for user ${session.user.id}:`, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      plan: planId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription upgraded successfully",
      user: {
        id: result.user.id,
        subscriptionStatus: result.user.subscriptionStatus,
        subscriptionPlan: result.user.subscriptionPlan,
        subscriptionEndDate: result.user.subscriptionEndDate,
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