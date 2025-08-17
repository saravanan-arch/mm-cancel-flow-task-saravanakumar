import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscriptionId, offerAccepted, offerPercent = 50 } = body;

    // Validate required fields
    if (!userId || !subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId and subscriptionId",
        },
        { status: 400 }
      );
    }

    // Validate offer percentage
    if (offerPercent < 1 || offerPercent > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid offer percentage. Must be between 1 and 100",
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      offer_percent: offerPercent,
      offer_accepted: offerAccepted,
      updated_at: new Date().toISOString(),
    };

    // Set timestamps based on offer decision
    if (offerAccepted) {
      updateData.offer_accepted_at = new Date().toISOString();
      updateData.offer_declined_at = null;
    } else {
      updateData.offer_declined_at = new Date().toISOString();
      updateData.offer_accepted_at = null;
    }

    // Update subscription offer status
    const { data, error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Database error occurred" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `Offer ${offerAccepted ? "accepted" : "declined"} successfully`,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from("subscriptions")
      .select(
        "id, offer_percent, offer_accepted, offer_accepted_at, offer_declined_at, status"
      )
      .eq("user_id", userId);

    if (subscriptionId) {
      query = query.eq("id", subscriptionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Database error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Subscription offer data retrieved successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
