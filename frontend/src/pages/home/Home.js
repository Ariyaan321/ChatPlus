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
    const [friendsList, setFriendsList] = useState({});
    const [exploreList, setExploreList] = useState([]);
    const [friendsListSelected, setFriendsListSelected] = useState(true)
    const [senderUser, setSenderUser] = useState("johny"); // will depend on who log's in
    const [selectedUser, setSelectedUser] = useState(null);
    const messageEndRef = useRef(null);
    const isFirstRender = useRef(true)
    useEffect(() => {

        // restricts first render, may have to remove this in production
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Prevents running on first mount
        }

        const fetchUsers = async () => {
            console.log('senderUser useEffect triggered');
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
        // Set currentUsers as friendsList here, so be defauly we see friends

        // At the time of fetching all users, we seperate the ones that are not friend
        fetchUsers();
        socket.emit('join', senderUser);
    }, [senderUser]);

    useEffect(() => {
        console.log('friendsList is: ', friendsList);
    }, [friendsList])

    useEffect(() => {
        // only "selectedUser" in dependency arr then "if" required !?        
        if (selectedUser !== null) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.post('http://localhost:8080/message/get', {
                        senderUsername: senderUser,
                        receiverUsername: selectedUser,
                    });
                    console.log('response on front: ', response);
                    setMessages(response.data);
                    // unread messages becomes 0
                    setFriendsList(prev => ({
                        ...prev,
                        [selectedUser]: 0
                    }));
                    const rdata = {
                        senderUsername: senderUser,
                        receiverUsername: selectedUser,
                        message: "ggeretsae",
                    }
                    socket.emit("message-notification-1", { data: rdata, status: 0 })
                } catch (error) {
                    console.error("No conversation found:", error);
                }
            };

            fetchMessages();
            // socket.emit('join', senderUser);
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

            if (messages === "!!") {
                setMessages([]);
            }
            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            setMesg("");
            socket.emit('send-Message', newMessageObj);
        }
    }

    function selectFriendsList(e) {
        e.preventDefault();
        setFriendsListSelected(true)
        // setCurrentUsers(friendsList)
    }
    function selectExploreList(e) {
        // console.log('explore');
        e.preventDefault();
        setFriendsListSelected(false)
        // setCurrentUsers(exploreList)
    }

    const handleUserClick = (receiverUsername) => {
        setSelectedUser(receiverUsername);
    };



    useEffect(() => {
        // The "data" received below will come from another user, this not same as newMessageObj above ; the newMessageObj above is for this senderUser only
        // acc. to above logic, can I remove "if" from setMessages ? since effect only receiver ?

        const handleReceiveMessage = (data) => {
            console.log('hrm , selectedUser: ', selectedUser, ' |  data.sender: ', data.senderUsername);
            console.log('receive-Message: ', data);

            if (senderUser === data.receiverUsername) {
                if (selectedUser === data.senderUsername) {
                    setMessages(prevMessages => [...prevMessages, data])
                }

                // storing messageNotification in DB comes here
                else {
                    // we send +1 request to backend socket => that will increment in DB ->  and send to receiverUser socket
                    // this way we don't need to rely on updating the friendsList completely !
                    // update receiver's unreadcount in friendsList   
                    // FLOW :-
                    // 1) senderUser = data > selectedUser
                    // 2) on selectedUser(senderUser) side: -
                    //  i) selectedUser not data.senderUser => friendsList[data.senderUser]++  =>  senderUser 
                    // gets unread noti so, senderUsers -> notificationMessage contains data.senderUser unreadCount
                    setFriendsList(prev => ({
                        ...prev,
                        [data.senderUsername]: (prev[data.senderUsername] || 0) + 1
                    }));

                    socket.emit('message-notification-1', { data, status: 1 })

                }
            }
            else {
                console.log('front - message-noti-1');
                socket.emit('message-notification-1', { data, status: 1 })
            }
        };

        socket.on('receive-Message', handleReceiveMessage);

        return () => {
            socket.off('receive-Message', handleReceiveMessage); // Cleanup listener
        };
    }, [selectedUser]); // No dependecny so run only once

    // useEffect to handle incrementing of messageNotification using socket



    // some socket to handle requestNotification



    // const sendConnectionRequest = (e) => {
    //     e.preventDefault();
    //     console.log('e conn. req: ', e);
    // }

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
                        {/* <div>James Bond</div> */}
                        <div>{selectedUser}</div>
                    </div>

                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                        {messages === "!!" ?
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
                        {
                            friendsListSelected ?
                                Object.entries(friendsList).map(([user, value], index) => (
                                    <div className='flex justify-between items-center text-white bg-blue-300 w-fit'>
                                        <li
                                            key={index}
                                            onClick={() => handleUserClick(user)}
                                            className="cursor-pointer p-2 hover:bg-gray-300"
                                        >
                                            {user}
                                        </li>

                                        {
                                            value === 0 || undefined ?
                                                null
                                                :
                                                <div className='w-4 rounded-lg bg-red-600 text-white font-bold ml-4'>
                                                    {value}
                                                </div>
                                        }

                                    </div>
                                ))

                                :

                                exploreList.map((user, index) => (
                                    <div className='flex justify-between text-white bg-blue-300 w-fit'>
                                        <li
                                            key={index}
                                            onClick={() => handleUserClick(user)}
                                            className="cursor-pointer p-2 hover:bg-gray-300"
                                        >
                                            {user}
                                        </li>

                                        <div className='w-5 rounded-lg text-2xl bg-black text-white cursor-pointer'>+</div>

                                    </div>
                                ))
                        }
                    </ul>


                    <div className='w-fit bg-red-500 text-white text-1xl flex flex-col'>
                        <button onClick={() => setSenderUser("johny")}>johny</button>
                        <button onClick={() => setSenderUser("mikey")}>mikey</button>
                        {/* <button onClick={handleUserSwitch("johny")}>johny</button>
                        <button onClick={handleUserSwitch("mikey")}>mikey</button> */}
                    </div>

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
// 1) message notification for unselected senderUser
// 2) connection request