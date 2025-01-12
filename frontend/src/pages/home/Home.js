import React, { useState, useEffect, useRef } from 'react';
import MessagesList from '../../components/messages';
import UsersList from '../../components/users';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

function Home() {
    const [msg, setMesg] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [senderUser, setSenderUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [clientSideMessage, setClientSideMessage] = useState(true);
    const messageEndRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.post('http://localhost:8080/message/get', {
                        senderUsername: senderUser,
                        receiverUsername: selectedUser,
                    });
                    setMessages(response.data);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };

            fetchMessages();
            socket.emit('join', senderUser);
            socket.emit('join', selectedUser);
        }
    }, [selectedUser, senderUser]);

    function handleEnterMessage(e) {
        setMesg(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setMesg(msg + "\n");
        } else if (e.key === 'Enter' && e.target.value.trim().length !== 0) {
            e.preventDefault();

            const newMessageObj = {
                senderUsername: senderUser,
                receiverUsername: selectedUser,
                message: msg,
            };

            socket.emit('send-Message', newMessageObj);
            setClientSideMessage(true);
            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            setMesg("");
        }
    }

    const handleUserClick = (receiverUsername) => {
        setSelectedUser(receiverUsername);
    };

    const handleSenderUserClick = (senderUsername) => {
        setSenderUser(senderUsername);
    };

    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">
                <div className="flex flex-col flex-grow w-full max-w-5xl bg-white shadow-xl overflow-hidden">
                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                        <MessagesList messages={messages} currentUsername={senderUser} />
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

                <div className="flex flex-col w-[33%] bg-gray-200 p-4 self-start absolute h-screen border-s-violet-600 border-4">
                    <h3 className="text-lg font-semibold">Users List</h3>
                    <ul>
                        {users.map(user => (
                            <li
                                key={user._id}
                                onClick={() => handleUserClick(user.Username)}
                                className="cursor-pointer p-2 hover:bg-gray-300"
                            >
                                {user.Username}
                            </li>
                        ))}
                    </ul>

                    <p><b>Select sender user</b></p>
                    <ul>
                        {users.map(user => (
                            <li
                                key={user._id}
                                onClick={() => handleSenderUserClick(user.Username)}
                                className="cursor-pointer p-2 hover:bg-gray-300"
                            >
                                {user.Username}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Home;
