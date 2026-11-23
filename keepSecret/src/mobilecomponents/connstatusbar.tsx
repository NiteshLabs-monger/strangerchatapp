import { Circle } from 'lucide-react'
import { useChatStore } from '../store/usechatstore.ts'
import { SmoothCountUp } from './numberanimation.tsx'

const ConnStatusBar = () => {
  const connStatus = useChatStore((state) => state.connStatus)
  const isConnected = connStatus.includes('Connected');
  const totalUsers = useChatStore((state) => state.activeUsers);
  return (
   <div className=" sticky w-full flex justify-center items-center">
      <div className="inline-flex w-fit items-center justify-center gap-2.5 px-3 py-1.5 mt-0.5 text-sm text-white bg-amber-800 rounded-full backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Circle
            className={`h-2.5 w-2.5 animate-pulse ${isConnected
              ? 'fill-emerald-500 text-emerald-500'
              : 'fill-amber-400 text-amber-400'
              }`}
          />
          <span>{isConnected ? 'Connected' : 'Searching'}</span>
        </div>

        <span className="text-amber-300/60">|</span>

        <span className="flex items-center justify-center h-7 min-w-[3.5rem] px-2.5 rounded-full bg-white text-amber-700 font-bold">
          <SmoothCountUp value={totalUsers} duration={0.5} />
        </span>
      </div>
   </div>
  )
}

export default ConnStatusBar