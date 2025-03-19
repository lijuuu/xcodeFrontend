import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChevronLeft, Copy, Server } from "lucide-react";

interface ApiResponseHistoryProps {
  apiHistory: any[];
  setView: React.Dispatch<React.SetStateAction<"list" | "details" | "testcases" | "languages" | "validation" | "api">>;
}

const ApiResponseHistory:React.FC<ApiResponseHistoryProps> =  ({ apiHistory, setView }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-6">
      <Button variant="outline" onClick={() => setView("list")} className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Response History</h2>
    </div>

    <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">API Call History</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">View all API requests and responses</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] rounded-md border border-gray-200 dark:border-[#1F1F23]">
          {apiHistory.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">No API calls recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {apiHistory.map((entry: any, index: number) => (
                <div key={index} className="border rounded-md border-gray-200 dark:border-[#1F1F23]">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#1F1F23]/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200">{entry.method.toUpperCase()} {entry.url}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.timestamp}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(entry, null, 2))} className="text-gray-700 dark:text-gray-300"><Copy className="h-4 w-4" /></Button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Sent Data</h4>
                      <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ padding: "12px", fontSize: "13px", backgroundColor: "transparent", margin: 0, borderRadius: "4px", border: "1px solid rgba(229, 231, 235, 0.5)" }}>{entry.sentData ? JSON.stringify(entry.sentData, null, 2) : "None"}</SyntaxHighlighter>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Received Data</h4>
                      <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ padding: "12px", fontSize: "13px", backgroundColor: "transparent", margin: 0, borderRadius: "4px", border: "1px solid rgba(229, 231, 235, 0.5)" }}>{JSON.stringify(entry.receivedData, null, 2)}</SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);


export default ApiResponseHistory;