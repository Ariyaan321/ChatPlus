import React, { useState, useEffect, useRef } from 'react';
import MessagesList from '../../components/messages';
// import UsersList from '../../components/users'; There is no user for this now
import axios from 'axios';
import { io } from 'socket.io-client';
import { request } from 'express';

const socket = io('http://localhost:8080');

function Home() {
    const [msg, setMesg] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentUsers, setCurrentUsers] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [exploreList, setExploreList] = useState([]);
    const [friendsListSelected, setFriendsListSelected] = useState(true)
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
        // only "selectedUser" in dependency arr then "if" required !?        
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

    function handleTypingMessage(e) {
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
            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            setMesg("");
        }
    }

    function selectFriendsList(e) {
        e.preventDefault();
        setFriendsListSelected(true)
        setCurrentUsers(friendsList)
    }
    function selectExploreList(e) {
        e.preventDefault();
        setFriendsListSelected(false)
        setCurrentUsers(exploreList)
    }

    const handleUserClick = (receiverUsername) => {
        setSelectedUser(receiverUsername);
    };

    // For new message notification - receive message
    useEffect(() => {
        // fun needed ? can just start with socket.on !?
        // The "data" received below will come from another user, this not same as newMessageObj above ; the newMessageObj above is for this senderUser only
        socket.on('receive-Message', (data) => {
            // this setMessages should handle "messages" correctly sinces message.senderUsername has changed in latest instance !?
            setMessages(prevMessages => [...prevMessages, data])
            if (selectedUser !== data.senderUsername) { // notification
                // change friendsList or currentUsers ?
                // trying to change friendsList only
                let friendIndex = friendsList.findIndex(([name]) => name === data.senderUsername)
                if (friendIndex !== -1) { // will not be -1 since checking done from backend
                    friendsList[friendIndex] = ++friendsList[friendIndex][1]
                }
            }
        })

    })

    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    return (
        <>
            <div className="flex flex-col items-end justify-center w-screen min-h-screen bg-green-300 text-gray-800">
                <div className='flex flex-col flex-grow bg-white w-[65%] min-w-[40%] max-w-[65%] shadow-xl overflow-hidden'>

                    {/* Profile photo */}
                    <div className='flex items-center gap-3 font-bold border-4 border-red-500 w-full p-3 pl-6 bg-green-500'>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                        <div>James Bond</div>
                        {/* <div>{selectedUser}</div> */}
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
                            onChange={handleTypingMessage}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* <div className="flex flex-col w-[33%] bg-gray-200 p-4 self-start absolute h-screen border-s-violet-600 border-4"> */}
                <div className="flex flex-col bg-gray-800 self-start absolute h-screen border-s-violet-600 border-r-yellow-500 border-4 overflow-auto min-w-[537px] max-w-[35%]" // max screen width 1535px

                >

                    <ul>
                        {currentUsers.map((user, index) => (
                            <div className='flex justify-between'>
                                <li
                                    key={index}
                                    onClick={() => handleUserClick(user)}
                                    className="cursor-pointer p-2 hover:bg-gray-300"
                                >
                                    {
                                        selectFriendsList === true ?
                                            // if no unread convo then return userName only
                                            user[0]
                                            :
                                            user
                                    }
                                </li>

                                {
                                    selectFriendsList === true ?

                                        user[1] === 0 ?
                                            null
                                            :
                                            <div className='w-4 rounded-lg bg-red-600 text-white font-bold'>
                                                {user[1]}
                                            </div>

                                        :
                                        <div className='w-5 rounded-lg text-2xl bg-black text-white'>+</div>
                                }

                            </div>
                        ))}
                    </ul>

                    <div className='mt-auto flex justify-between bg-emerald-400 text-2xl font-bold'>
                        <button onClick={selectFriendsList} className='border-4 border-red-600 w-[50%] py-5'>Friends</button>
                        <button onClick={selectExploreList} className='border-4 border-purple-600 w-[50%] py-5'>Explore</button>
                    </div>
                </div>
            </div >
        </>
    );
}

export default Home;


// 2 notification's schema will be of following types:-
// 1) Connection request - required >  username only (data in this db will expire after 5 days)
// 2) New message from friend -> username only ; if not selectedUser

// need to test following:
// 1) testing send and receive messages
// 2) testing notification system