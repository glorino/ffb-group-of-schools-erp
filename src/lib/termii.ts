const TERMII_BASE_URL = "https://termii.com/api";

function getApiKey(overrideKey?: string): string {
  const key = overrideKey ?? process.env.TERMII_API_KEY;
  if (!key) throw new Error("TERMII_API_KEY is not configured");
  return key;
}

function getSenderId(): string {
  return process.env.TERMII_SENDER_ID || "FFBSchool";
}

export interface SMSResponse {
  code: string;
  message: string;
  requestId: string;
}

export interface BulkSMSResponse {
  code: string;
  message: string;
  requestId: string;
}

export interface OTPResponse {
  code: string;
  requestId: string;
  message: string;
  pin: string;
  status: string;
  balance: string;
}

export interface VerifyOTPResponse {
  verifyStatus: string;
  requestId: string;
  message: string;
}

export type SMSType = "plain" | "unicode";
export type OTPChannel = "dnd" | "whatsapp" | "voice";

export async function sendSMS(
  to: string,
  message: string,
  type: SMSType = "plain"
): Promise<SMSResponse> {
  const apiKey = getApiKey();
  const senderId = getSenderId();

  const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to,
      from: senderId,
      sms: message,
      type,
      channel: "generic",
    }),
  });

  const result = await response.json();

  if (result.code !== "ok") {
    throw new Error(result.message || "Failed to send SMS");
  }

  return result as SMSResponse;
}

export async function sendBulkSMS(
  recipients: string[],
  message: string,
  type: SMSType = "plain"
): Promise<BulkSMSResponse> {
  const apiKey = getApiKey();
  const senderId = getSenderId();

  const response = await fetch(`${TERMII_BASE_URL}/sms/send/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to: recipients,
      from: senderId,
      sms: message,
      type,
      channel: "generic",
    }),
  });

  const result = await response.json();

  if (result.code !== "ok") {
    throw new Error(result.message || "Failed to send bulk SMS");
  }

  return result as BulkSMSResponse;
}

export async function sendOTP(
  phone: string,
  channel: OTPChannel = "dnd"
): Promise<OTPResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${TERMII_BASE_URL}/sms/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      pin_length: 6,
      message_type: "NUMERIC",
      to: phone,
      from: getSenderId(),
      channel,
      expires_in: 300,
    }),
  });

  const result = await response.json();

  if (result.code !== "ok") {
    throw new Error(result.message || "Failed to send OTP");
  }

  return result as OTPResponse;
}

export async function verifyOTP(
  phone: string,
  code: string,
  apiKeyOverride?: string
): Promise<VerifyOTPResponse> {
  const apiKey = getApiKey(apiKeyOverride);

  const response = await fetch(`${TERMII_BASE_URL}/sms/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      pin_id: code,
      pin: code,
    }),
  });

  const result = await response.json();

  if (result.verifyStatus !== "success") {
    throw new Error(result.message || "OTP verification failed");
  }

  return result as VerifyOTPResponse;
}
