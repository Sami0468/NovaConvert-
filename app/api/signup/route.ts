import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createUser, findUserByEmail } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (findUserByEmail(normalizedEmail)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    createUser({ id: randomUUID(), name, email: normalizedEmail, password: hashed, provider: "credentials" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
