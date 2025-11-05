// app/api/auth/session/route.ts
import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	const res = NextResponse.next(); // Create a response object
	const session = await getSession(req, res);
	console.log("getSession: ", session);
	if (!session) {
		return new Response("Not logged in", { status: 401 });
	}

	return NextResponse.json({
		accessToken: session.accessToken,
		session: session,
	});
}
