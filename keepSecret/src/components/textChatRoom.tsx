import { useEffect, useState } from "react"

export default  function ChatRoom(){
  const ws = new WebSocket('ws://localhost/ws')
  const [message,setMessage] = useState(null);
  const sendmessage = () => {
    const 
  }
  return (
    <>
     <div className="h-60  w-5/6 bg-amber-400 p-2 relative">
     <div className="message flex items-center justify-center gap-2 absolute bottom-1.5">
      <input type="text" placeholder="type your message:" value={} />
      <button className="bg-amber-600 border-amber-950 rounded-full">send</button>
     </div>




     </div>
    </>
  )

}