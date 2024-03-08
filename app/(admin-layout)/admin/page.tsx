"use client";
import LoginPage from "@/app/(public-layout)/(auth)/login/page";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, FormEvent, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  // Add more properties as needed
}

export default function Admin() {
  const [apiKey, setApiKey] = useState<string>("");
  const [assistantKey, setAssistantKey] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!session) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <LoginPage />
      </div>
    );
  }

  if (session && !session.user.id) {
    return <div>You must be signed in to view this page</div>;
  }

  const deleteUser = async (id: any) => {
    try {
      const response = await fetch("/api/deleteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error deleting user");
      }

      // Refetch users after deletion
      fetchUsers();

      // Alert the success message
      alert("User deleted successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/updateKeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey, assistantKey }),
      });

      if (response.ok) {
        alert("Keys updated successfully");
      } else {
        alert("Failed to update keys");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="apiKey"
          >
            API Key:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="assistantKey"
          >
            Assistant Key:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-400 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="assistantKey"
            type="text"
            value={assistantKey}
            onChange={(e) => setAssistantKey(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className=" text-gray-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Update Keys
          </Button>
        </div>
      </form>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 ">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800">
                  <tr>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th> */}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Delete User
                    </th>
                    {/* Add more columns as needed */}
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id}
                </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <Button
                          variant="destructive"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </td>
                      {/* Add more cells as needed */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
