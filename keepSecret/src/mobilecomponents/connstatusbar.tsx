import { Circle } from 'lucide-react'
import { useChatStore } from '../store/usechatstore.ts'

const ConnStatusBar = () => {
  return (
    <div className="flex items-center justify-center gap-2 p-1 text-sm text-amber-700 bg-amber-800/50 rounded-full backdrop-blur-md">
      <div className="flex items-center gap-1">
        <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500 animate-pulse" />
        <span className="ml-2"> {useChatStore((state) => state.connStatus)}</span>
      </div>
      <div>{useChatStore((state) => state.activeUsers)}</div>
    </div>
  )
}

export default ConnStatusBar