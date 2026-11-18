import { GraduationCap } from "lucide-react";

function Logo({
    size = "md",
    showText = true,
    className = ""
}) {
    const sizes = {
        sm: {
            container: "h-8 w-8 rounded-lg",
            icon: 18,
            text: "text-base"
        },

        md: {
            container: "h-10 w-10 rounded-xl",
            icon: 22,
            text: "text-lg",
        },
        lg: {
            container: "h-14 w-14 rounded-2xl",
            icon: 30,
            text: "text-2x;"
        },
    };

    const current = sizes[size] || sizes.md;
    return (
        <div classsName={`inline-flex items-center gap-3 ${className}`}>
            <div className={`flex shrink-0 items-center justify-center bg-white text-black ${current.container}`}>
                <GraduationCap size={current.icon} strokeWidth={2.2} />
            </div>

            {showText && (
                <span className={`font-semibold tracking-tight text-white ${current.text}`}>
                    StuddyBuddy
                </span>
            )}
        </div>
    )
}

export default Logo;