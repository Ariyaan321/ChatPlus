import React, { useState, useEffect, useRef } from 'react';
import MessagesList from '../../components/messages';
// import UsersList from '../../components/users'; There is no user for this now
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

function Home() {
    const [msg, setMesg] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentUsers, setCurrentUsers] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [exploreList, setExploreList] = useState([]);
    const [conversationAvailable, setConversationAvailable] = useState(true);
    const [senderUser, setSenderUser] = useState("johndoeF"); // will depend on who log's in
    const [selectedUser, setSelectedUser] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState('60%'); // Default width
    // const [clientSideMessage, setClientSideMessage] = useState(true);
    const messageEndRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users', {
                    params: { username: senderUser }
                });
                console.log('response: ', response);
                setFriendsList(response.data.friendsList)
                setExploreList(response.data.exploreList)
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        // At the time of fetching all users, we seperate the ones that are not friend
        fetchUsers();
    }, [senderUser]);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.post('http://localhost:8080/message/get', {
                        senderUsername: senderUser,
                        receiverUsername: selectedUser,
                    });
                    console.log('response on front: ', response);
                    if (response.data === "!!") {
                        setConversationAvailable(false)
                    } else {
                        setMessages(response.data);
                    }
                } catch (error) {
                    console.error("No conversation found:", error);
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
            // setClientSideMessage(true);
            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            setMesg("");
        }
    }

    const handleUserClick = (receiverUsername) => {
        setSelectedUser(receiverUsername);
    };

    // const handleSenderUserClick = (senderUsername) => {
    //     setSenderUser(senderUsername);
    // };

    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">
                <div className="flex flex-col flex-grow bg-white shadow-xl overflow-hidden" //max-w-5xl
                    style={{ minWidth: sidebarWidth }}
                >
                    {/* <div
                    className="flex flex-col flex-grow max-w-5xl bg-white shadow-xl overflow-hidden"
                    style={{ marginLeft: `${sidebarWidth}px` }} // Adjusts dynamically
                > */}

                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                        {!conversationAvailable ?
                            <p>No conversation found</p>
                            :
                            <MessagesList messages={messages} currentUsername={senderUser} />
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

                {/* <div className="flex flex-col w-[33%] bg-gray-200 p-4 self-start absolute h-screen border-s-violet-600 border-4"> */}
                {/* <div className="flex flex-col bg-gray-200 p-4 self-start absolute h-screen border-s-violet-600 border-4 resize-x overflow-auto min-w-[200px] max-w-[50%]"> */}
                <div
                    className='flex flex-col bg-gray-200 p-4 self-start absolute h-screen border-s-violet-600 border-4 resize-x overflow-auto min-w-[400px] max-w-[50%]'
                // style={{ width: `${sidebarWidth}px` }}
                // onChange={(e) => setSidebarWidth(Math.max(200, Math.min(e.clientX, window.innerWidth * 0.5)))}
                >

                    <ul>
                        {currentUsers.map((user, index) => (
                            <li
                                key={index}
                                onClick={() => handleUserClick(user)}
                                className="cursor-pointer p-2 hover:bg-gray-300"
                            >
                                {user}
                            </li>
                        ))}
                    </ul>

                    <div className='mt-auto border-8 border-red-400'>
                        <button onClick={() => setCurrentUsers(friendsList)} className='border-red-600'>Friends</button>
                        <button onClick={() => setCurrentUsers(exploreList)} className='pl-10'>Explore</button>
                    </div>
                    {/* <p><b>Select sender user</b></p>
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
                    </ul> */}
                </div>
            </div >
        </>
    );
}

export default Home;
