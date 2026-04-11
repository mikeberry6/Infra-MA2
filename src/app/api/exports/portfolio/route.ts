import { NextResponse } from "next/server";
import { getAllCompanies } from "@/modules/companies/queries";

export async function GET() {
  try {
    const companies = await getAllCompanies();

    return NextResponse.json({
      data: companies,
      count: companies.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Portfolio export failed:", error);
    return NextResponse.json(
      { error: "Failed to export portfolio" },
      { status: 500 },
    );
  }
}
