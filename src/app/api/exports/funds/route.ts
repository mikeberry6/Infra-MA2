import { NextResponse } from "next/server";
import { getAllFunds } from "@/modules/funds/queries";

export async function GET() {
  try {
    const funds = await getAllFunds();

    return NextResponse.json({
      data: funds,
      count: funds.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fund export failed:", error);
    return NextResponse.json(
      { error: "Failed to export funds" },
      { status: 500 },
    );
  }
}
