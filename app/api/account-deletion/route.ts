import { NextResponse } from "next/server";
import { z } from "zod";

const deletionRequestSchema = z.object({
  contactMethod: z.enum(["email", "phone"]),
  contactValue: z.string(),
  reason: z.enum([
    "no_longer_needed",
    "privacy_concerns",
    "switching_service",
    "not_satisfied",
    "other",
  ]),
  customReason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = deletionRequestSchema.parse(body);

    // Here you would typically:
    // 1. Save the deletion request to your database
    // 2. Send notification emails
    // 3. Start the account deletion process
    // For now, we'll just simulate a successful request

    // Call api to delete account
    const response = await fetch(process.env.ACCOUNT_DELETION_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to delete account");
    }

    return NextResponse.json(
      {
        message: "Demande de suppression reçue avec succès",
        data: validatedData,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Données de formulaire invalides",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Une erreur s'est produite lors du traitement de votre demande",
      },
      { status: 500 }
    );
  }
}
