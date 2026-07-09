import { NextRequest, NextResponse } from "next/server";

// Routes that are temporarily disabled
const DISABLED_ROUTES = ["/international", "/crypto/send", "/crypto/convert"];

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
    matcher: ["/international/:path*", "/crypto/send/:path*", "/crypto/convert/:path*"],
};
