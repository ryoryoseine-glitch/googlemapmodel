import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const userId = request.cookies.get("current_user_id")?.value;
    const hasProfile = request.cookies.get("has_farm_profile")?.value === "true";
    const { pathname } = request.nextUrl;

    // 1. Allow access to static files
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // 2. Auth page handling
    if (pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    // 3. Mandatory Authentication check
    if (!userId) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 4. Onboarding page - always allow for logged-in users (new signup + profile edit)
    if (pathname === "/onboarding") {
        return NextResponse.next();
    }

    // If profile is incomplete, redirect to onboarding
    if (!hasProfile) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
