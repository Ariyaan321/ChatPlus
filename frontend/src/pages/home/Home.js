import React, { useState, useEffect, useRef } from 'react';
import MessagesList from '../../components/messages'
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

function Home() {

    const [msg, setMesg] = useState("");
    const [messages, setMessages] = useState([]);  // state to store all messages
    const [clientSideMessage, setClientSideMessage] = useState(true);
    const messageEndRef = useRef(null);

    function handleEnterMessage(e) {
        setMesg(e.target.value)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setMesg(msg + "\n");
        }

        // send to server -> that will send to receiver room
        else if (e.key === 'Enter' && e.target.value.trim().length !== 0) {
            e.preventDefault();

            const newMessageObj = {
                senderUsername: "johndoe",
                receiverUsername: "mike",
                message: msg
            }

            socket.emit('send-Message', newMessageObj);
            setClientSideMessage(true);
            setMessages(prevMessages => [...prevMessages, newMessageObj]); // add new message
            setMesg("");
        }
    }

    useEffect(() => {
        socket.emit('join', "johndoe");

        socket.on('receive-Message', (message) => {
            console.log('in receive message here: ', message);
            setClientSideMessage(false);
            setMessages(prevMessages => [...prevMessages, message]); // add received message
        });

        // Fetch messages from the backend when the component mounts
        const fetchMessages = async () => {
            try {
                const response = await axios.post('http://localhost:8080/message/get', {
                    senderUsername: 'johndoe',
                    receiverUsername: 'mike',
                });
                console.log('listOfMessages received at frontend with response: ', response.data);
                setMessages(response.data); // Assuming the data is returned as an array of messages
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, []);  // Only run once on mount

    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">
                <div className="flex flex-col flex-grow w-full max-w-5xl bg-white shadow-xl overflow-hidden">
                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                        <MessagesList messages={messages} currentUsername="johndoe" />
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
    );
}

export default Home;
