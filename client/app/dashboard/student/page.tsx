"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Star, Heart, CheckCircle } from "lucide-react";
import axios from "@/lib/axios";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Session = {
  id: string;
  expert_id: string;
  expert_name: string;
  expert_profile_image?: string;
  date: string;
  duration: number;
  topic: string;
  status: string;
};

type Expert = {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  specialty: string;
  hourly_rate: number;
  rating: number;
  tags: string[];
  bio: string;
  languages: string[];
  experience_years: number;
  completed_sessions: number;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [upcomingSession, setUpcomingSession] = useState<Session | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkedExperts, setBookmarkedExperts] = useState<string[]>([])

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);

        // Fetch upcoming sessions
        const response = await axios.get("/api/students/sessions", {
          params: { status: "scheduled" },
        });

        if (response.data && response.data.length > 0) {
          // Sort sessions by date (ascending)
          const sortedSessions = response.data.sort(
            (a: Session, b: Session) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Filter only future sessions
          const futureSessions = sortedSessions.filter(
            (session: Session) => new Date(session.date) > new Date()
          );

          // Set the nearest upcoming session
          if (futureSessions.length > 0) {
            setUpcomingSession(futureSessions[0]);
          }

          // Set total session count
          setSessionCount(futureSessions.length);
        } else {
          setUpcomingSession(null);
          setSessionCount(0);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setUpcomingSession(null);
        setSessionCount(0);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`/api/students/recommendations`);
        console.log(res)
        const expertIds = res.data.map((rec: any) => rec.tutor_id);
        console.log("Expert IDs:", expertIds);

        if (expertIds.length > 0) {
          const profilesRes = await axios.post("/api/students/experts/ids", {
            expert_ids: expertIds,
          });

          setExperts(profilesRes.data);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setExperts([]);
      }
    };

    // Only fetch if user is authenticated
    if (user && user.id) {
      fetchSessions();
      fetchRecommendations();
    }
  }, []);

  const handleFindExperts = () => {
    router.push("/dashboard/student/find-tutors");
  };

  const handleScheduleLesson = () => {
    router.push("/dashboard/student/lessons?tab=calendar");
  };

  const handleViewSession = (sessionId: string) => {
    router.push(`/dashboard/student/lessons/${sessionId}`);
  };
  const handleBookmark = async (expertId: string) => {
    try {
      if (bookmarkedExperts.includes(expertId)) {
        await axios.delete(`/api/students/bookmark/${expertId}`);
        setBookmarkedExperts(bookmarkedExperts.filter((id) => id !== expertId));
      } else {
        await axios.post(`/api/students/bookmark/${expertId}`);
        setBookmarkedExperts([...bookmarkedExperts, expertId]);
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleExpertClick = (expertId: string) => {
    router.push(`/dashboard/student/experts/${expertId}`);
  };


  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 rounded-lg bg-[#fff2e7] p-6">
        <h1 className="mb-2 text-2xl font-bold text-deep-cocoa">
          How&apos;s it going, {user?.first_name || "there"}?
        </h1>
        <h2 className="mb-6 text-3xl font-bold text-deep-cocoa">
          Get extra hours to continue learning
        </h2>

        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-gray-100">
              {user?.profile_image ? (
                <img
                  src={user.profile_image || "/placeholder.svg"}
                  alt={user.first_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                  <User size={40} className="text-deep-cocoa" />
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-deep-cocoa">
              {sessionCount} lessons
            </h3>
            <p className="text-gray-500">on your balance</p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="mb-4 w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63] hover:cursor-pointer"
              size="lg"
              onClick={handleScheduleLesson}
            >
              Add extra lessons
            </Button>
          </motion.div>

          <Button
            variant="link"
            className="w-full text-deep-cocoa hover:cursor-pointer"
            onClick={handleFindExperts}
          >
            Upgrade subscription
          </Button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-deep-cocoa">
          Upcoming Lesson
        </h2>
        {loading ? (
          <Card>
            <CardContent className="p-0">
              <div className="animate-pulse">
                <div className="flex flex-col md:flex-row">
                  <div className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 md:w-2/3 md:border-b-0 md:border-r">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200"></div>
                      <div className="h-3 w-48 rounded bg-gray-200"></div>
                      <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-4 md:w-1/3">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-8 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : upcomingSession ? (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 md:w-2/3 md:border-b-0 md:border-r">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                    {upcomingSession.expert_profile_image ? (
                      <img
                        src={
                          upcomingSession.expert_profile_image ||
                          "/placeholder.svg"
                        }
                        alt={upcomingSession.expert_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                        <span className="text-sm font-bold text-deep-cocoa">
                          {upcomingSession.expert_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-deep-cocoa">
                      {upcomingSession.expert_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {upcomingSession.topic}
                    </p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span className="mr-2">
                        {format(
                          new Date(upcomingSession.date),
                          "EEE, MMM d, yyyy"
                        )}
                      </span>
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {format(new Date(upcomingSession.date), "h:mm a")}
                      </span>
                      <span className="ml-2">
                        ({upcomingSession.duration} min)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 md:w-1/3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium capitalize text-green-800">
                    {upcomingSession.status}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                    onClick={() => handleViewSession(upcomingSession.id)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="mb-2 text-xl font-bold text-deep-cocoa">
                No upcoming lessons
              </h3>
              <p className="mb-6 text-gray-500">
                Don&apos;t put your goals on hold!
                <br />
                Schedule your next lesson now to see progress.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                  onClick={handleScheduleLesson}
                >
                  Schedule lesson
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-bold text-deep-cocoa">
            Recommended Experts
          </h2>

          {experts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
              <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">
                No experts found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <motion.div
                  key={expert.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card className="h-full overflow-hidden shadow-md transition-shadow hover:shadow-lg">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleExpertClick(expert.id)}
                    >
                      <div className="relative h-48 bg-gray-100">
                        {expert.profile_image ? (
                          <img
                            src={expert.profile_image}
                            alt={`${expert.first_name} ${expert.last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                            <span className="text-4xl font-bold text-white">
                              {expert.first_name[0]}
                              {expert.last_name[0]}
                            </span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white hover:cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(expert.id);
                          }}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              bookmarkedExperts.includes(expert.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                            }`}
                          />
                        </Button>
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="font-semibold text-deep-cocoa">
                            {expert.first_name} {expert.last_name}
                          </h3>
                          <div className="flex items-center text-sm text-amber-500">
                            <Star className="mr-1 h-4 w-4 fill-amber-500" />
                            {expert.rating.toFixed(1)}
                          </div>
                        </div>

                        <p className="mb-3 text-sm text-gray-500">
                          {expert.specialty}
                        </p>

                        <div className="mb-3 flex flex-wrap gap-2">
                          {expert.languages?.slice(0, 3).map((language) => (
                            <Badge
                              key={language}
                              variant="outline"
                              className="bg-[#fff8f0] text-deep-cocoa"
                            >
                              {language}
                            </Badge>
                          ))}
                          {expert.languages?.length > 3 && (
                            <Badge
                              variant="outline"
                              className="bg-[#fff8f0] text-deep-cocoa"
                            >
                              +{expert.languages.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {expert.experience_years} years
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {expert.completed_sessions} sessions
                          </div>
                        </div>

                        <p className="line-clamp-2 text-sm text-gray-600">
                          {expert.bio}
                        </p>
                      </CardContent>
                    </div>

                    <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
                      <div>
                        <p className="text-lg font-semibold text-deep-cocoa">
                          ${expert.hourly_rate.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                      <Button
                        className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63] hover:cursor-pointer"
                        onClick={() => handleExpertClick(expert.id)}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
