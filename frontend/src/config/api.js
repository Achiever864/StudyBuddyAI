const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export default async function api(path, { method = "GET", body, headers = {} } = {}) {
    const token = localStorage.getItem("token");
    const isForm = body instanceof FormData;

    const res = await fetch(BASE_URL + path, {
        method,
        headers: {
            ...(body && !isForm && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
}