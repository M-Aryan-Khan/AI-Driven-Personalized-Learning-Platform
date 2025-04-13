
"use client";

import api from "../../api/Api";
import React from "react";
import { useEffect, useState } from "react";
const UserList = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token")?.split("_")[0];
    api.get("http://localhost:8000/educators",{
      headers: {
      Authorization: `Bearer ${token}`,
    },})
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
    <h1>Educators Names</h1>
    <ul>
      {users.map((user: any) => (
        <li key={user._id}>{user.name}</li> 
      ))}
    </ul>
  </main>
  );
};

export default UserList;
