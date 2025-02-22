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
                        setConversationAvailable(true)
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


    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">
                <div className='flex flex-col flex-grow bg-white w-[65%] min-w-[40%] max-w-[65%] shadow-xl overflow-hidden'
                >

                    <div className='flex items-center border-4 border-red-500 w-full h-[60px] bg-green-500'>
                        <span>account</span>
                    </div>

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
                <div className="flex flex-col bg-gray-800 self-start absolute h-screen border-s-violet-600 border-r-yellow-500 border-4 overflow-auto min-w-[537px] max-w-[35%]" // max 1535px

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

                    <div className='mt-auto flex justify-between bg-emerald-400 text-2xl font-bold'>
                        <button onClick={() => setCurrentUsers(friendsList)} className='border-4 border-red-600 w-[50%] py-5'>Friends</button>
                        <button onClick={() => setCurrentUsers(exploreList)} className='border-4 border-purple-600 w-[50%] py-5'>Explore</button>
                    </div>
                </div>
            </div >
        </>
    );
}

export default Home;
