import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "http://127.0.0.1:8001";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  if (!clientId) {
    return NextResponse.json({ error: "client_id required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/favorites?client_id=${clientId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // FastAPI DELETE /favorites expects query params, not a request body
    const body = await request.json();
    const { client_id, recipe_id } = body as { client_id: string; recipe_id: number };
    const res = await fetch(
      `${API_BASE}/favorites?client_id=${encodeURIComponent(client_id)}&recipe_id=${recipe_id}`,
      { method: "DELETE" }
    );
    return new Response(null, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
