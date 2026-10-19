import { getDb } from "../../../lib/mongodb";

// Open /api/health to check that the app can reach MongoDB.
export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json({ ok: true, database: db.databaseName });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
