import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Razorpay webhook events
interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email: string;
        contact: string;
        notes: {
          userId?: string;
          plan?: string;
        };
        error_code?: string;
        error_description?: string;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        notes: {
          userId?: string;
          plan?: string;
        };
      };
    };
  };
  created_at: number;
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[WEBHOOK] Webhook secret not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("[WEBHOOK] Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("[WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: RazorpayWebhookEvent = JSON.parse(body);
    console.log(`[WEBHOOK] Received event: ${event.event}`);

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      case "order.paid":
        await handleOrderPaid(event);
        break;

      case "refund.created":
        await handleRefundCreated(event);
        break;

      case "subscription.activated":
      case "subscription.charged":
      case "subscription.completed":
      case "subscription.cancelled":
        // Handle subscription events if using Razorpay subscriptions
        console.log(`[WEBHOOK] Subscription event: ${event.event}`);
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment?.entity;
  if (!payment) return;

  console.log(`[WEBHOOK] Payment captured: ${payment.id}`);

  // Check if payment already exists
  const existingPayment = await prisma.payment.findFirst({
    where: { razorpayPaymentId: payment.id },
  });

  if (existingPayment) {
    // Update payment status if needed
    if (existingPayment.status !== "completed") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "completed" },
      });
    }
    return;
  }

  // If payment doesn't exist but we have user info, this is a backup capture
  const userId = payment.notes?.userId;
  if (userId) {
    console.log(`[WEBHOOK] Creating payment record for user ${userId}`);
    
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount: payment.amount,
          currency: payment.currency,
          status: "completed",
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          planId: payment.notes?.plan || "unknown",
          planName: payment.notes?.plan || "Unknown Plan",
          billingPeriod: "monthly",
        },
      });
    } catch (error) {
      console.error("[WEBHOOK] Error creating payment record:", error);
    }
  }
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment?.entity;
  if (!payment) return;

  console.log(`[WEBHOOK] Payment failed: ${payment.id}`, {
    error_code: payment.error_code,
    error_description: payment.error_description,
  });

  // Log failed payment for debugging
  const userId = payment.notes?.userId;
  if (userId) {
    try {
      // Create a failed payment record for tracking
      await prisma.payment.create({
        data: {
          userId,
          amount: payment.amount,
          currency: payment.currency,
          status: "failed",
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          planId: payment.notes?.plan || "unknown",
          planName: payment.notes?.plan || "Unknown Plan",
          billingPeriod: "monthly",
        },
      });
    } catch (error) {
      console.error("[WEBHOOK] Error logging failed payment:", error);
    }
  }
}

async function handleOrderPaid(event: RazorpayWebhookEvent) {
  const order = event.payload.order?.entity;
  if (!order) return;

  console.log(`[WEBHOOK] Order paid: ${order.id}`);

  // This is a confirmation that the order was paid
  // The main logic is handled in payment.captured
}

async function handleRefundCreated(event: RazorpayWebhookEvent) {
  // Handle refund - downgrade user subscription if needed
  console.log(`[WEBHOOK] Refund created`);
  // Implement refund logic based on your business requirements
}

// GET handler for webhook verification (Razorpay may ping this)
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
