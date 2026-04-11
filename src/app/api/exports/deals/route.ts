import { NextResponse } from "next/server";
import { getAllDeals } from "@/modules/deals/queries";

export async function GET() {
  try {
    const deals = await getAllDeals();

    // Return as JSON for now; can be extended to Excel/CSV export
    return NextResponse.json({
      data: deals,
      count: deals.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deal export failed:", error);
    return NextResponse.json(
      { error: "Failed to export deals" },
      { status: 500 },
    );
  }
}
