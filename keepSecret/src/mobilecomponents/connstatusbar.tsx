import { Circle } from 'lucide-react'
import { useChatStore } from '../store/usechatstore.ts'
import { SmoothCountUp } from './numberanimation.tsx'

const ConnStatusBar = () => {
  const connStatus = useChatStore((state) => state.connStatus)
  return (
    <span className="inline-flex items-center p-2 justify-center  gap-2 mt-0.5 text-white bg-amber-800 rounded-full backdrop-blur-md">
      <div className="flex items-center gap-1">
        <Circle className={`h-3 w-3 ${connStatus.includes('Connected') ? 'fill-amber-500 text-amber-500':'fill-emerald-500 text-emerald-500' } animate-pulse`} />
        <span className="ml-2"> {connStatus.includes('Connected') ? 'Connected' : 'Searching'}</span>
      </div> |
      <span className="p-0.5 px-2 rounded-full bg-white text-amber-600 font-bold ">
        <SmoothCountUp value={useChatStore.getState().activeUsers} duration={0.5} />
      </span>
    </span>
  )
}

export default ConnStatusBar