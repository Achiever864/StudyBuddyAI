import { useEffect } from "react";

export default function AuthCallback() {
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) localStorage.setItem("token", token);

        window.location.replace(token ? "/chat" : "/login");
    }, []);

    return (
        <p className="flex min-h-screen items-center justify-center bg-black text-neutral-500">
            Signing you in...
        </p>
    );
}