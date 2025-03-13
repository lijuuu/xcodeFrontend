import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  useNavigate } from "react-router-dom";
import { getUser, clearAuthState } from "@/redux/authSlice";
import { toast } from "sonner";
import Cookies from "js-cookie";
import NavHeader from "@/components/sub/NavHeader";

// Define the structure for a problem
interface Problem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string[];
  status: "Solved" | "Attempted" | "Not Attempted";
}

// Dummy problems data
const dummyRecentSubmissions: Problem[] = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: ["Array", "Hash Table"], status: "Solved" },
  { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: ["String", "Sliding Window"], status: "Attempted" },
  { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: ["Array", "Binary Search"], status: "Solved" },
  { id: 4, title: "Add Two Numbers", difficulty: "Medium", category: ["Linked List", "Math"], status: "Solved" },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Attempted" },
  { id: 6, title: "Reverse Integer", difficulty: "Easy", category: ["Math"], status: "Solved" },
  { id: 7, title: "Container With Most Water", difficulty: "Medium", category: ["Array", "Two Pointers"], status: "Not Attempted" },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile, error, loading, isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    console.log("Home State on Mount:", { userProfile, error, loading, isAuthenticated });

    const accessToken = Cookies.get("accessToken");
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      navigate("/login");
      toast.info("Please log in to access this page.");
      return;
    }

    if (!userProfile && accessToken) {
      dispatch(getUser() as any)
        .unwrap()
        .then(() => {
          toast.success("User profile loaded!");
        })
        .catch((err: any) => {
          dispatch(clearAuthState());
          navigate("/login");
          toast.error("Session expired. Please log in again.");
        });
    }
  }, [dispatch, navigate, userProfile, isAuthenticated]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error.message}</div>;
  if (!userProfile) return null;

  return (
    <>
      <NavHeader
        logout={true}
        name="Home"
      />
      {/* Recent Submissions Card */}
      <div className="container-right-3 h-auto w-full bg-black rounded-lg shadow-sm p-6 overflow-y-auto transition-colors duration-200">
        <h3 className="text-2xl font-semibold text-blue-700 mb-4 font-coinbase-display">Recent Problems</h3>
        <div className="space-y-3">
          {dummyRecentSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="flex justify-between items-center p-3 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors duration-200 hover:scale-y-110  hover:ease-linear"
            >
              <div>
                <p className="text-sm text-gray-300 font-coinbase-sans">{submission.title}</p>
                <div className="text-xs text-gray-400 font-coinbase-sans mt-1 space-y-1">
                  <p
                    className={`${
                      submission.difficulty === "Easy"
                        ? "text-green-400"
                        : submission.difficulty === "Medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {submission.difficulty}
                  </p>
                  <div className="flex items-center space-x-2">
                    {submission.category.map((category) => (
                      <p
                        key={category}
                        className="text-gray-400 font-coinbase-sans bg-gray-800 px-2 py-1 rounded-md"
                      >
                        {category}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium font-coinbase-sans ${
                  submission.status === "Solved"
                    ? "bg-green-900 text-white"
                    : submission.status === "Attempted"
                    ? "bg-yellow-900 text-white"
                    : "bg-red-900 text-white"
                }`}
              >
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;