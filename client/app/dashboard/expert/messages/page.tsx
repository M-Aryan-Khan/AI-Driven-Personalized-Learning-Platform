"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from 'lucide-react'
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

type Conversation = {
  id: string
  student_id: string
  student_name: string
  student_profile_image?: string
  last_message: string
  last_message_date: string
  unread: boolean
}

type Message = {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  content: string
  timestamp: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const studentParam = searchParams.get("student")

  const [activeTab, setActiveTab] = useState("all")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string
    name: string
    profile_image?: string
  } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: "1",
      student_id: "stud1",
      student_name: "Alex J.",
      student_profile_image: undefined,
      last_message: "Thank you for the session",
      last_message_date: "2023-03-17T12:00:00Z",
      unread: false,
    },
  ]

  const mockMessages: Message[] = [
    {
      id: "msg1",
      sender_id: user?.id || "",
      sender_name: user?.first_name + " " + user?.last_name || "You",
      sender_role: "expert",
      content: "Hello! How can I help you with your learning goals?",
      timestamp: "2023-03-15T10:00:00Z",
    },
    {
      id: "msg2",
      sender_id: "stud1",
      sender_name: "Alex J.",
      sender_role: "student",
      content: "Hi, I'm interested in scheduling a lesson.",
      timestamp: "2023-03-15T10:05:00Z",
    },
    {
      id: "msg3",
      sender_id: user?.id || "",
      sender_name: user?.first_name + " " + user?.last_name || "You",
      sender_role: "expert",
      content: "Great! I have availability this week. What topics are you interested in?",
      timestamp: "2023-03-15T10:10:00Z",
    },
    {
      id: "msg4",
      sender_id: "stud1",
      sender_name: "Alex J.",
      sender_role: "student",
      content: "I'd like to focus on advanced concepts. When are you available?",
      timestamp: "2023-03-16T09:00:00Z",
    },
    {
      id: "msg5",
      sender_id: user?.id || "",
      sender_name: user?.first_name + " " + user?.last_name || "You",
      sender_role: "expert",
      content: "I can do Thursday at 3pm or Friday at 2pm. Which works better for you?",
      timestamp: "2023-03-16T09:15:00Z",
    },
    {
      id: "msg6",
      sender_id: "stud1",
      sender_name: "Alex J.",
      sender_role: "student",
      content: "Friday at 2pm works for me.",
      timestamp: "2023-03-16T10:00:00Z",
    },
    {
      id: "msg7",
      sender_id: user?.id || "",
      sender_name: user?.first_name + " " + user?.last_name || "You",
      sender_role: "expert",
      content: "Thank you for the session",
      timestamp: "2023-03-17T12:00:00Z",
    },
  ]

  useEffect(() => {
    // In a real app, this would fetch from the API
    const fetchConversations = async () => {
      try {
        setLoading(true)
        // API call would go here
        setConversations(mockConversations)
      } catch (error) {
        // Silently handle error - don't show error messages
        console.error("Error fetching conversations:", error)
        setConversations([]) // Set empty array instead of showing error
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    if (studentParam) {
      // If student param exists, set the selected conversation
      const student = {
        id: "stud1",
        name: "Alex J.",
        profile_image: undefined,
      }
      setSelectedStudent(student)
      setSelectedConversation("1")
      setMessages(mockMessages)
    }
  }, [studentParam, user])

  useEffect(() => {
    if (selectedConversation) {
      // In a real app, this would fetch messages for the selected conversation
      const fetchMessages = async () => {
        try {
          // API call would go here
          setMessages(mockMessages)
          scrollToBottom()
        } catch (error) {
          // Silently handle error - don't show error messages
          console.error("Error fetching messages:", error)
          setMessages([]) // Set empty array instead of showing error
        }
      }

      fetchMessages()
    }
  }, [selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const newMsg: Message = {
      id: `msg${Date.now()}`,
      sender_id: user?.id || "",
      sender_name: user?.first_name + " " + user?.last_name || "You",
      sender_role: "expert",
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")

    // In a real app, this would send the message to the API
    setTimeout(scrollToBottom, 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "short" })
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id)
    setSelectedStudent({
      id: conversation.student_id,
      name: conversation.student_name,
      profile_image: conversation.student_profile_image,
    })
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Messages</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex-1">
                Archived
              </TabsTrigger>
            </TabsList>

            <Card className="overflow-hidden">
              <TabsContent value="all" className="m-0">
                {loading ? (
                  <div className="animate-pulse space-y-4 p-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                            <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        whileHover={{ backgroundColor: "#fff2e7" }}
                        className={`cursor-pointer p-4 ${
                          selectedConversation === conversation.id ? "bg-[#fff2e7]" : ""
                        } ${conversation.unread ? "font-semibold" : ""}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="flex gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={conversation.student_profile_image || "/placeholder.svg"}
                              alt={conversation.student_name}
                            />
                            <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                              {conversation.student_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between">
                              <h3 className="truncate text-deep-cocoa">{conversation.student_name}</h3>
                              <span className="text-xs text-gray-500">
                                {formatDate(conversation.last_message_date)}
                              </span>
                            </div>
                            <p className="truncate text-sm text-gray-600">{conversation.last_message}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="m-0">
                <div className="p-6 text-center">
                  <p className="text-gray-500">No unread messages</p>
                </div>
              </TabsContent>

              <TabsContent value="archived" className="m-0">
                <div className="p-6 text-center">
                  <p className="text-gray-500">No archived conversations</p>
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </div>

        <Card className="flex h-[600px] flex-col md:col-span-2">
          {selectedConversation && selectedStudent ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedStudent.profile_image || "/placeholder.svg"} alt={selectedStudent.name} />
                  <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-deep-cocoa">{selectedStudent.name}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender_role === "expert"

                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isCurrentUser ? "bg-[#ffc6a8] text-deep-cocoa" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p>{message.content}</p>
                          <div
                            className={`mt-1 text-right text-xs ${
                              isCurrentUser ? "text-deep-cocoa/70" : "text-gray-500"
                            }`}
                          >
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <h2 className="mb-2 text-xl font-semibold text-deep-cocoa">Select a conversation</h2>
              <p className="mb-6 text-gray-500">
                Choose a conversation from the list to start messaging with your students.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
