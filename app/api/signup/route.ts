import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByUsername } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, firstName, lastName, email, phoneNumber, address, country, dateOfBirth, password, confirmPassword } = body;

    // Validation
    if (!username || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser({
      username,
      firstName,
      lastName,
      email,
      password, // In production, hash this
      phoneNumber: phoneNumber || "",
      address: address || "",
      country: country || "",
      dateOfBirth: dateOfBirth || "",
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 500 }
    );
  }
}
