import { NextRequest, NextResponse } from "next/server";

// Routes that are temporarily disabled
const DISABLED_ROUTES = ["/cash", "/international"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isDisabled = DISABLED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isDisabled) {
        return NextResponse.redirect(new URL("/crypto", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/cash/:path*", "/international/:path*"],
};
