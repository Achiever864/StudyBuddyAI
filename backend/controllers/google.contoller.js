import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

const getCookie = (req, name) =>
    req.headers.cookie?.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1];


const makeUsername = async (base) => {
    const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
    let username = clean;
    while (await User.exists({ username })) {
        username = `${clean}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return username;
};

const googleRedirect = (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");

    res.cookie("g_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

const googleCallback = async (req, res) => {
    const { code, state, error } = req.query;
    const fail = (msg) => res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(msg)}`);

    if (error || !code) return fail("Google sign-in was cancelled.");
    if (!state || state !== getCookie(req, "g_state")) return fail("Sign-in expired. Try again.");
    res.clearCookie("g_state");

    try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                grant_type: "authorization_code",
            }),
        });
        const tokens = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokens.error_description || "Token exchange failed");

        const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await profileRes.json();
        if (!profile.email_verified) return fail("Your Google email isn't verified.");

        let user = await User.findOne({ email: profile.email });
        if (!user) {
            user = await User.create({
                username: await makeUsername(profile.name || profile.email.split("@")[0]),
                email: profile.email,
                googleId: profile.sub,
                avatar: profile.picture,
            });
        } else if (!user.googleId) {
            user.googleId = profile.sub;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (err) {
        console.error("Google auth error:", err);
        fail("Google sign-in failed. Try again.");
    }
};


export {
    googleCallback,
    googleRedirect
}