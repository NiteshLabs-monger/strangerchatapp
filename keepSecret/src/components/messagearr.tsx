
import type { Message } from "../../types/type";
import Reaction from "./reaction";

interface MessageProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (msg: MessageProps["message"]) => void; 
  removeReaction : (messageId:string) => void

}

export const MessageBubble = ({ message, onReact,onReply ,removeReaction }: MessageProps) => {
 

  return (
    <>
    {message.sender === "user"? ( 
    <>
    <Reaction message={message} onReact={onReact} onReply={onReply}/>
    <div className=" bg-amber-700 rounded-2xl flex flex-col justify-center items center p-2 w-fit  text-amber-300 rounded-br-none">
       {message.replyTo && (
  <div
    className="mb-1 pl-2 border-l-4  border-amber-600 bg-black/10 rounded-sm py-1 pr-2 cursor-pointer"
    onClick={() => {
      document
        .getElementById(`msg-${message.replyTo!.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }}
  >
    <div className="text-xs font-bold opacity-80">
      {message.replyTo.sender === "user" ? "You" : "Stranger"}
    </div>
    <div className="text-sm opacity-90 truncate">
      {message.replyTo.content}
    </div>
  </div>
)}
      
      <p>{message.content}</p>
      { (message.reactions?.user || message.reactions?.stranger) && (
        <div className=" relative animate-emoji-pop h-7 w-7  bg-amber-400 rounded-full flex -bottom-3 items-center">
          {message.reactions?.user && (
            <button
              
              type="button"
              onClick={() => {removeReaction(message.id)}}
              
              className={`inline-flex items-center  bg-amber-800  border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.user}</span>
            </button>)}
            {message.reactions?.stranger && (
            <button
              
              type="button"
            
              
              className={`inline-flex items-center bg-white border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.stranger}</span>
            </button>
          )}
        </div>)}
    </div>
    

    </>
   ):(
    <>
    <div className="bg-white text-amber-700  p-2 w-fit rounded-2xl rounded-bl-none">
       {message.replyTo && (
  <div
    className="mb-1 pl-2 border-l-4  border-amber-600 bg-black/10 rounded-sm py-1 pr-2 cursor-pointer"
    onClick={() => {
      document
        .getElementById(`msg-${message.replyTo!.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }}
  >
    <div className="text-xs font-bold opacity-80">
      {message.replyTo.sender === "user" ? "You" : "Stranger"}
    </div>
    <div className="text-sm opacity-90 truncate">
      {message.replyTo.content}
    </div>
  </div>
)}
      <p>{message.content}</p>
      { (message.reactions?.user || message.reactions?.stranger) && (
        <div className=" relative h-7 w-7 animate-emoji-pop bg-amber-400  rounded-full flex -bottom-3 items-center">
          {message.reactions?.user && (
            <button
              
              type="button"
               onClick={() => {removeReaction(message.id)}}
              
              
              className={`inline-flex items-center bg-amber-800  border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.user}</span>
            </button>)}
            {message.reactions?.stranger && (
            <button
              
              type="button"
            
              
              className={`inline-flex items-center bg-white border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.stranger}</span>
            </button>
          )}
        </div>)}
      
    </div>
    
    <Reaction message={message} onReact={onReact} onReply={onReply}/>
    </>
   )}

    
     

    
      
     
    </>
  );
};
