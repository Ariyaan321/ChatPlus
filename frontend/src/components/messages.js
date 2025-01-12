import React, { useEffect, useState } from 'react';

const MessagesList = ({ messages, currentUsername }) => {

    // console.log('created at: ', messages);
    // console.log('messages sender name: ', messages[0]?.senderUsername, " | current name: ", currentUsername);

    const timeMin = (timestamp) => {
        const now = new Date();
        const createdAt = new Date(timestamp);
        const diffInMs = now - createdAt; // Difference in milliseconds
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // Convert to minutes

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        console.log('diffindays: ', diffInDays);
        if (diffInDays === "NaN") return '0s ago';
        else return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    };


    return (
        <div>
            {messages.map((message, index) => (
                // is it message.senderUsername OR IS IT message[0] ?
                message.senderUsername === currentUsername ?
                    (
                        <div key={index} >
                            <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                                <div>
                                    <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                                        <p>
                                            {message.message && message.message.split("\n").map((line, idx) => (
                                                <React.Fragment key={idx}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 leading-none">{timeMin(message.createdAt)}</span>
                                </div>
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                            </div>
                        </div>
                    )
                    :
                    (
                        <div key={index} className="flex w-full mt-2 space-x-3 max-w-xs">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                            <div>
                                <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                                    <p>
                                        {message.message && message.message.split("\n").map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 leading-none">{timeMin(message.createdAt)}</span>
                            </div>
                        </div>
                    )
            ))
            };
        </div>
    )
}

export default MessagesList;   