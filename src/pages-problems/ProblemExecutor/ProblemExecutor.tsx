import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const BASE_URL = "http://localhost:7000/api/v1/execute"; // Adjust based on your backend API

const ProblemExecutor = () => {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExecute = async () => {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await axios.post(BASE_URL, {
        language,
        code,
        input,
        expected_output: expectedOutput,
      });

      if (response.data.success) {
        setOutput(response.data.output || "Execution successful, no output.");
        toast.success("Code executed successfully!", {
          duration: 3000,
          style: {
            background: "#1A1A1A",
            color: "#D1D5DB",
            border: "1px solid #4B5563",
            // "--toastify-color-success": "#38A89D",
          },
        });
      } else {
        setError(response.data.error || "Execution failed.");
        toast.error(response.data.error || "Execution failed.", {
          duration: 5000,
          style: {
            background: "#1A1A1A",
            color: "#D1D5DB",
            border: "1px solid #4B5563",
            // "--toastify-color-error": "#F87171",
          },
        });
      }
    } catch (err) {
      setError("An error occurred while executing the code.");
      toast.error("An error occurred while executing the code.", {
        duration: 5000,
        style: {
          background: "#1A1A1A",
          color: "#D1D5DB",
          border: "1px solid #4B5563",
          // "--toastify-color-error": "#F87171",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-gray-200 p-6">
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-100">Problem Executor</CardTitle>
          <CardDescription className="text-gray-400">
            Write and execute code for a selected problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="language" className="text-gray-300">Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full bg-gray-800/50 border-gray-600 text-gray-200 p-2 rounded-md focus:ring-teal-800/30"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div>
            <Label htmlFor="code" className="text-gray-300">Code</Label>
            <Textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="mt-1 min-h-[200px] bg-gray-800/50 border-gray-600 text-gray-200 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="input" className="text-gray-300">Input</Label>
              <Input
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input..."
                className="mt-1 bg-gray-800/50 border-gray-600 text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="expectedOutput" className="text-gray-300">Expected Output</Label>
              <Input
                id="expectedOutput"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="Enter expected output..."
                className="mt-1 bg-gray-800/50 border-gray-600 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          <Button
            onClick={handleExecute}
            disabled={loading || !code.trim()}
            className="bg-gradient-to-r from-teal-800 to-gray-900 text-gray-200 hover:from-teal-900 hover:to-gray-800 w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Execute"}
          </Button>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          {output && (
            <div className="mt-4">
              <Label className="text-gray-300">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="mt-1 min-h-[100px] bg-gray-800/50 border-gray-600 text-gray-200"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemExecutor;