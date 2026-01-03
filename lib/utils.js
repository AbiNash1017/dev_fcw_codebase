import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const checkCookies = async () => {
    const call1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/setCookie`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const call2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkCookie`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const response = await call2.json();
    if (response.cookieMessage) {
        alert(response.cookieMessage);
    }
};
