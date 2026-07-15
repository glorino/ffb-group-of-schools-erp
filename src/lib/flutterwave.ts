const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function getHeaders() {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error("FLW_SECRET_KEY is not configured");
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

export interface PaymentMetadata {
  studentId?: string;
  invoiceId?: string;
  [key: string]: unknown;
}

export interface InitializePaymentParams {
  amount: number;
  email: string;
  name: string;
  metadata?: PaymentMetadata;
  callback_url?: string;
}

export interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
    reference: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    status: string;
    created_at: string;
    account_id: number;
    card: Record<string, unknown> | null;
    meta: PaymentMetadata | null;
    amount_settled: number;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
      created_at: string;
    };
  };
}

export async function initializePayment({
  amount,
  email,
  name,
  metadata = {},
  callback_url,
}: InitializePaymentParams): Promise<FlutterwavePaymentResponse> {
  const publicKey = process.env.FLW_PUBLIC_KEY;
  if (!publicKey) throw new Error("FLW_PUBLIC_KEY is not configured");

  const txRef = `FFB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const body: Record<string, unknown> = {
    tx_ref: txRef,
    amount,
    currency: "NGN",
    redirect_url: callback_url ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
    meta: {
      ...metadata,
      txRef,
    },
    customer: {
      email,
      name,
    },
  };

  if (metadata.studentId) {
    (body.customer as Record<string, unknown>).studentId = metadata.studentId;
  }

  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Failed to initialize payment");
  }

  return result as FlutterwavePaymentResponse;
}

export async function verifyPayment(
  transactionId: string
): Promise<FlutterwaveVerifyResponse> {
  const response = await fetch(
    `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
    { method: "GET", headers: getHeaders() }
  );

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Failed to verify payment");
  }

  return result as FlutterwaveVerifyResponse;
}
