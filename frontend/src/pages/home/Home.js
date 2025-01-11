import React, { useState, useEffect, useRef } from 'react';

function Home() {

    const [msg, setMesg] = useState("");
    const messageEndRef = useRef(null);

    // This will come from messages.js in component folder
    const [messages, setMessages] = useState(
        [
            ["Lorem ipsum dolor sit amet, consectetur adipiscing elit."],
            ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod."],
            ["Lorem ipsum dolor sit amet."],
            ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
            ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
            ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."],
        ]
    )


    function handleEnterMessage(e) {
        setMesg(e.target.value)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setMesg(msg + "\n");
        }

        else if (e.key === 'Enter' && e.target.value.trim('').length !== 0) {
            e.preventDefault();
            setMessages((prevMessages) => [...prevMessages, [msg]]);
            setMesg("".trim(''));
        }
    }

    useEffect(() => {
        console.log('message end ref: ', messageEndRef);
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">

                <div className="flex flex-col flex-grow w-full max-w-5xl bg-white shadow-xl overflow-hidden">

                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">

                        {
                            messages.map((message, id) => (
                                id % 2 === 0 ? (
                                    <div key={id} className="flex w-full mt-2 space-x-3 max-w-xs">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                                        <div>
                                            <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                                                <p>
                                                    {message.map((line, idx) => (
                                                        <span key={idx}>
                                                            {line.split("\n").map((line, index) => (
                                                                <React.Fragment key={index}>
                                                                    {line}
                                                                    <br />
                                                                </React.Fragment>
                                                            ))}
                                                        </span>
                                                    ))}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 leading-none">2 min ago</span>
                                        </div>
                                    </div>
                                ) :
                                    (
                                        <div key={id} >
                                            <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                                                <div>
                                                    <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                                                        <p>
                                                            {message.map((line, idx) => (
                                                                <span key={idx}>
                                                                    {line.split("\n").map((line, index) => (
                                                                        <React.Fragment key={index}>
                                                                            {line}
                                                                            <br />
                                                                        </React.Fragment>
                                                                    ))}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 leading-none">2 min ago</span>
                                                </div>
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                                            </div>
                                        </div>

                                    )
                            ))

                        }
                        <div ref={messageEndRef} />
                    </div>

                    <div className="bg-gray-300 p-4">
                        <textarea
                            className="flex items-center w-full h-14 p-1 rounded text-sm mt-2 outline-none resize-none"
                            placeholder="Type your message…"
                            value={msg}
                            onChange={handleEnterMessage}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                </div>
            </div>
        </>
    )
}

export default Home;