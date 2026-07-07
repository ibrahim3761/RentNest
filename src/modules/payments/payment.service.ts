import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import config from "../../config";
import { stripe } from "../../lib/stripe";


const createCheckoutSession = async (
  rentalRequestId: string,
  tenantId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: rentalRequestId },
    include: { property: true },
  });

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      "You are not authorized to pay for this request.",
      httpStatus.FORBIDDEN,
    );
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      "Only approved rental requests can be paid.",
      httpStatus.BAD_REQUEST,
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { rentalRequestId },
  });

  if (existingPayment && existingPayment.status === "COMPLETED") {
    throw new AppError(
      "Payment already completed for this rental.",
      httpStatus.BAD_REQUEST,
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: rentalRequest.property.title,
            description: `Rent for ${rentalRequest.property.location}, ${rentalRequest.property.city}`,
          },
          unit_amount: Math.round(rentalRequest.property.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: {
      rentalRequestId,
      tenantId,
    },
  });

  await prisma.payment.upsert({
    where: { rentalRequestId },
    update: { sessionId: session.id, status: "PENDING" },
    create: {
      rentalRequestId,
      tenantId,
      amount: rentalRequest.property.price,
      status: "PENDING",
      sessionId: session.id,
    },
  });

  return { url: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret,
    );
  } catch {
    throw new AppError("Invalid webhook signature.", httpStatus.BAD_REQUEST);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const rentalRequestId = session.metadata?.rentalRequestId;
    const tenantId = session.metadata?.tenantId;

    if (!rentalRequestId || !tenantId) {
      throw new AppError("Missing metadata in session.", httpStatus.BAD_REQUEST);
    }

    await prisma.payment.update({
      where: { rentalRequestId },
      data: {
        status: "COMPLETED",
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: "ACTIVE" },
    });
  }

  return { received: true };
};

const getMyPayments = async (tenantId: string, role: string) => {
  const result = await prisma.payment.findMany({
    where: role === "ADMIN" ? {} : { tenantId },
    include: {
      tenant: { omit: { password: true } },
      rentalRequest: {
        include: { property: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getPaymentById = async (
  paymentId: string,
  tenantId: string,
  role: string,
) => {
  const result = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      tenant: { omit: { password: true } },
      rentalRequest: {
        include: { property: true },
      },
    },
  });

  if (role !== "ADMIN" && result.tenantId !== tenantId) {
    throw new AppError(
      "You are not authorized to view this payment.",
      httpStatus.FORBIDDEN,
    );
  }

  return result;
};

export const paymentService = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};