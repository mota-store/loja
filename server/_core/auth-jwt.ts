import { COOKIE_NAME } from "@shared/const";
import { jwtVerify } from "jose";
import type { Request } from "express";
import * as db from "../db";
import { ENV } from "./env";

export async function authenticateRequest(req: Request) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const verified = await jwtVerify(token, secret);
    const openId = verified.payload.openId as string;

    if (!openId) {
      return null;
    }

    const user = await db.getUserByOpenId(openId);
    return user || null;
  } catch (error) {
    console.error("[Auth] JWT verification failed:", error);
    return null;
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value.trim());
    }
  });
  return cookies;
}
