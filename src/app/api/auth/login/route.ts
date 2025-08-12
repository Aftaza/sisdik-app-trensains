import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.msg }, { status: response.status });
    }

    const { jwt } = data;

    (await cookies()).set("session_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request body", errors: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}