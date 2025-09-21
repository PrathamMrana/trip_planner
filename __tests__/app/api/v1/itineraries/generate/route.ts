import { type NextRequest, NextResponse } from "next/server"
import { validateTripRequest } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { generateItinerary } from "@/lib/ai-orchestrator"
import { saveItinerary } from "@/lib/firestore"

export async function POST(request: NextRequest) {
  try {
    // Rate limit to prevent abuse
    const rl = await rateLimit(request)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil(((rl.reset || Date.now()) - Date.now()) / 1000).toString() } },
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Validate input
    const validationResult = validateTripRequest(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request data", details: validationResult.errors }, { status: 400 })
    }

    const tripRequest = validationResult.data

    // Generate via Gemini (with orchestrator handling retries and schema validation)
    const result = await generateItinerary(tripRequest)
    if (!result.success || !result.data) {
      return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 502 })
    }

    // Persist itinerary (if Firestore is configured, the helper will store it; otherwise it throws)
    let saved
    try {
      saved = await saveItinerary({ ...result.data, tripRequest })
    } catch (e) {
      // If Firestore isn't configured, still return generated data with a transient ID
      const fallbackId = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      saved = { id: fallbackId }
      console.warn("Firestore not configured, returning unsaved itinerary with temporary id", e)
    }

    return NextResponse.json({
      id: saved.id,
      status: "success",
      message: "Itinerary generated successfully",
      confidence_score: result.data.metadata?.confidence_score ?? 0.85,
    })
  } catch (error) {
    console.error("Error in generate itinerary API:", error)
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}

// Note: Fetching a specific itinerary is handled in `app/api/v1/itineraries/[id]/route.ts` via Firestore.
