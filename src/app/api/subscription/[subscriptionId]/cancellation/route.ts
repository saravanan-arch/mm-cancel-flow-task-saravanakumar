import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      subscriptionId,
      downsellVariant,
      flowData,
      currentStep,
      completed,
      // Core business fields for individual columns
      gotJob,
      cancelReason,
      companyVisaSupport,
      acceptedDownsell,
      finalDecision,
    } = body;

    // Validate required fields
    if (!userId || !subscriptionId || !downsellVariant) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare data for hybrid schema
    const cancellationData = {
      user_id: userId,
      subscription_id: subscriptionId,
      downsell_variant: downsellVariant,

      // Core business fields (individual columns)
      got_job: gotJob || null,
      cancel_reason: cancelReason || null,
      company_visa_support: companyVisaSupport || null,
      accepted_downsell: acceptedDownsell || false,
      final_decision: finalDecision || null,

      // Detailed responses (JSONB)
      flow_data: flowData || {},

      // Flow progress
      current_step: currentStep || 1,
      completed: completed || false,

      // Timestamps
      updated_at: new Date().toISOString(),
    };

    // Insert or update cancellation record
    let { data, error } = await supabase
      .from("cancellations")
      .upsert(cancellationData, {
        onConflict: "user_id,subscription_id",
        ignoreDuplicates: false,
      });

    // If upsert fails due to missing unique constraint, try insert instead
    if (error && error.code === "42P10") {
      console.warn(
        "Unique constraint not found, trying insert instead:",
        error.message
      );

      // Try to insert new record
      const { data: insertData, error: insertError } = await supabase
        .from("cancellations")
        .insert(cancellationData);

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          {
            success: false,
            error:
              "Database error occurred. Please run the migration script to add unique constraint.",
            details: insertError.message,
          },
          { status: 500 }
        );
      }

      data = insertData;
      error = null;
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error occurred",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Cancellation data saved successfully",
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
      .from("cancellations")
      .select("*")
      .eq("user_id", userId);

    if (subscriptionId) {
      query = query.eq("subscription_id", subscriptionId);
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
      message: "Cancellation data retrieved successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
