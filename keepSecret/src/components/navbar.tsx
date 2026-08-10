import React from "react";

export default function Navbar(){
    return (
        <nav className=" h-17 w-full bg-amber-900 flex justify-start items-center">
            <h1 className="w-1/7 text-2xl font-bold flex justify-center gap-3 items-center">
                <p className="text-xl text-amber-400 ">
                    Keep
                </p>
                <p className="h-full p-1.5 bg-amber-400 rounded-sm ">Secret</p>
            </h1>
            
        </nav>
    )
}