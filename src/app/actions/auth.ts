"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isValidSessionToken,
} from "@/lib/session";

const STATIC_OTP = "441812";

export type OtpFormState = {
  error?: string;
} | undefined;

export async function verifyOtp(prevState: OtpFormState, formData: FormData): Promise<OtpFormState> {
  const otp = String(formData.get("otp") ?? "").trim();

  if (!otp || !secureEquals(otp, STATIC_OTP)) {
    return { error: "Invalid OTP. Please try again." };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function requireSession() {
  const valid = await hasValidSession();
  if (!valid) {
    redirect("/login");
  }
}

export async function hasValidSession() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

async function createSession() {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires,
  });
}

function secureEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}
