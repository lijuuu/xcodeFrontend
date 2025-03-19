import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronLeft, Loader2, RefreshCw, Check, AlertCircle } from "lucide-react";

interface LanguagesViewProps {
  selectedProblem: any;
  handleApiCall: any;
  setView: React.Dispatch<React.SetStateAction<"details" | "list" | "api" | "testcases" | "languages" | "validation">>;
  loading:boolean
}

  // Validation View
  const ValidationView:React.FC<LanguagesViewProps> = ({handleApiCall,selectedProblem,setView,loading}) => {
    const [validationResult, setValidationResult] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
  
    const onValidate = async () => {
      setIsValidating(true);
      try {
        const res = await handleApiCall("get", "/validate", null, { problem_id: selectedProblem.problem_id });
        setValidationResult({ success: res.success, message: res.message || (res.success ? "All checks passed" : "Validation failed"), error_type: res.error_type });
      } catch {
        setValidationResult({ success: false, message: "Validation failed", error_type: null });
      } finally {
        setIsValidating(false);
      }
    };
  
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" onClick={() => setView("list")} className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Validate: {selectedProblem?.title}</h2>
        </div>
  
        <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Problem Validation</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Check if the problem is correctly configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-zinc-900/50 dark:text-zinc-100/50" />
              <p className="text-gray-600 dark:text-gray-400 mb-6">Validate test cases and language support configuration.</p>
              <Button onClick={onValidate} disabled={isValidating || loading} size="lg" className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                {(isValidating || loading) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Run Validation
              </Button>
            </div>
          </CardContent>
        </Card>
  
        {validationResult && (
          <Card className={validationResult.success ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10" : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10"}>
            <CardHeader>
              <CardTitle className={validationResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{validationResult.success ? "Validation Successful" : "Validation Failed"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {validationResult.success ? <Check className="h-8 w-8 text-green-600 dark:text-green-400" /> : <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />}
                <div>
                  <p className={validationResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{validationResult.message}</p>
                  {validationResult.error_type && <p className="text-red-600 dark:text-red-400 text-sm">Error Type: {validationResult.error_type}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { if (validationResult.success) setView("list"); else if (validationResult.error_type?.includes("testcase")) setView("testcases"); else if (validationResult.error_type?.includes("language")) setView("languages"); }} className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]">{validationResult.success ? "Back to List" : "Fix Issues"}</Button>
                <Button variant="outline" onClick={() => setView("api")} className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]">View API Response</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  export default ValidationView;