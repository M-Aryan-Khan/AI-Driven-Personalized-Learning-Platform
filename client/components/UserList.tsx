"use client";
import { User } from "../types/user";

interface Props {
  users: User[];
}

const UserList = ({ users }: Props) => (
  <ul>
    {users.map((user, idx) => (
      <li key={idx}>{user.name}</li>
    ))}
  </ul>
);

export default UserList;
