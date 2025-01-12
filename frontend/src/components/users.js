import React, { useState, useEffect } from 'react';
import axios from 'axios'

export default function Users() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // Fetch all users
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users'); // Endpoint to get all users
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    return users;
}