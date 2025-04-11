"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserList from "../components/UserList";
import { User } from "../types/user";

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/users")
      .then(res => {
        const userArray: User[] = res.data.users.map((name: string) => ({ name }));
        setUsers(userArray);
      })
      .catch(err => {
        console.error("Error:", err.message);
      });
  }, []);

  return (
    <main>
      <h1>Welcome</h1>
      <UserList users={users} />
    </main>
  );
}
