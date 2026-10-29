import { useState } from 'react'
import { Reply, FaceSlightlySmiling } from "lucide-react"
import { EmojiPickerPopover } from './emojipicker';

import { type reactionProps } from '../../types/type';



const Reaction = ({ message, onReact, onReply }: reactionProps) => {
    const [showPicker, setShowPicker] = useState(false);
    return (
        <>
            <div className=" top-1 flex  gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onReply(message)} title="Reply" className="p-1 rounded-full ">
                    <Reply size={20} className="text-amber-800" />
                </button>
                <button onClick={() => setShowPicker((v) => !v)} title="React" className="p-1 rounded-full ">
                    <FaceSlightlySmiling size={24} className="text-amber-800" />
                </button>
            </div>
            {showPicker && (
                <EmojiPickerPopover
                    onSelect={(emoji) => onReact(message.id, emoji)}
                    onClose={() => setShowPicker(false)}
                    positionClass={`${message.sender==="user"? "right-0":"left-0"} top-full`}
                />
            )}
        </>
    )
}

export default Reaction