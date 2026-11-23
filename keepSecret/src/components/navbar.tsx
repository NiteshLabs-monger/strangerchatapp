import { Circle } from "lucide-react";
import { SmoothCountUp } from "../mobilecomponents/numberanimation";
import { useChatStore } from "../store/usechatstore";


export default function Navbar(){
    const totalUsers = useChatStore((s) => s.activeUsers);

    return (
        <nav className="w-full h-14 sm:h-16 px-4 sm:px-8 bg-amber-900 border-b border-amber-700/40 flex items-center justify-between shrink-0">
            {/* Brand Logo */}
            <h1 className="w-fit shrink-0 flex items-center gap-1.5 sm:gap-2 font-bold select-none">
                <span className="text-lg sm:text-xl md:text-2xl text-amber-400 tracking-tight">
                    Keep
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-base sm:text-lg md:text-xl bg-amber-400 text-amber-950 rounded-md shadow-sm">
                    Secret
                </span>
            </h1>

            {/* Optional Right Slot (e.g., ConnStatusBar or Nav Links) */}
            <div className="flex items-center gap-2 sm:gap-4">
                <span className="flex items-center justify-center h-7 min-w-[3.5rem] px-2.5 rounded-full bg-white text-amber-700 font-bold">
                    <Circle
                        className={`h-2.5 w-2.5 animate-pulse fill-emerald-500 text-emerald-500`}
                    />
          <SmoothCountUp value={totalUsers} duration={0.5} />
        </span>
            </div>
        </nav>
    )
}