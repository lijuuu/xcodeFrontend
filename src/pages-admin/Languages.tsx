import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Editor } from "@monaco-editor/react";
import { ChevronLeft, Loader2, Maximize2, Minimize2, CodeIcon, AlertCircle, Check } from "lucide-react";


const languageSchema = z.object({
  language: z.string().min(1, "Language is required"),
  placeholder: z.string().min(1, "Placeholder is required"),
  code: z.string().min(1, "Validation code is required"),
  template: z.string().min(1, "Template code is necessary"),
});

type LanguageFormData = z.infer<typeof languageSchema>

interface LanguageSupport {
  language: string
  placeholder: string
  code: string
  template: string
}
interface LanguagesViewProps {
  selectedProblem: any;
  handleApiCall: any;
  setView: React.Dispatch<React.SetStateAction<"details" | "list" | "api" | "testcases" | "languages" | "validation">>;
}
const LanguagesView: React.FC<LanguagesViewProps> = ({selectedProblem,handleApiCall,setView}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: { language: "", placeholder: "", code: "", template: "" },
    mode: "onChange",
  });

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageSupport | null>(null);
  const [languages, setLanguages] = useState<LanguageSupport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTemplateFullScreen, setIsTemplateFullScreen] = useState(false);
  const [isPlaceholderFullScreen, setIsPlaceholderFullScreen] = useState(false);
  const [isCodeFullScreen, setIsCodeFullScreen] = useState(false);

  // Sync languages with selectedProblem.validate_code when it changes
  useEffect(() => {
    if (selectedProblem?.validate_code) {
      const languageSupports = Object.entries(selectedProblem.validate_code).map(([language, code]) => {
        const typedCode = code as { placeholder?: string; code?: string; template?: string };
        return {
          language,
          placeholder: typedCode.placeholder || "",
          code: typedCode.code || "",
          template: typedCode.template || "",
        };
      });
      setLanguages(languageSupports);
    } else {
      setLanguages([]);
    }
  }, [selectedProblem]);

  const formatLanguageName = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "python": return "Python";
      case "javascript": return "JavaScript";
      case "cpp": return "C++";
      case "go": return "Go";
      default: return lang;
    }
  };

  const getLanguageIcon = (lang: string) => {
    const colors = {
      python: "text-blue-500",
      javascript: "text-yellow-500",
      cpp: "text-purple-500",
      go: "text-cyan-500",
    };
    return (
      <CodeIcon
        className={`h-5 w-5 ${colors[lang.toLowerCase() as keyof typeof colors] || "text-zinc-900 dark:text-zinc-100"}`}
      />
    );
  };

  const defaultPlaceholder = {
    python: {
      placeholder: "# Write your Python solution here\n",
      code: "def validate_solution():\n    # Add validation logic here\n    pass\n",
      template: "# Template code for users\nclass Solution:\n    def solve(self):\n        pass\n",
    },
    javascript: {
      placeholder: "// Write your JavaScript solution here\n",
      code: "function validateSolution() {\n    // Add validation logic here\n}\n",
      template: "// Template code for users\nfunction solution() {\n    return null;\n}\n",
    },
    cpp: {
      placeholder: "// Write your C++ solution here\n#include <iostream>\n",
      code: "#include <iostream>\nbool validateSolution() {\n    // Add validation logic here\n    return true;\n}\n",
      template: "#include <iostream>\nclass Solution {\npublic:\n    bool solve() {\n        return false;\n    }\n};\n",
    },
    go: {
      placeholder: "// Write your Go solution here\npackage main\n",
      code: "package main\nfunc validateSolution() bool {\n    // Add validation logic here\n    return true;\n}\n",
      template: "package main\ntype Solution struct{}\nfunc (s Solution) Solve() bool {\n    return false\n}\n",
    },
  };

  const languageMap = {
    python: "python",
    javascript: "javascript",
    cpp: "cpp",
    go: "go",
  };

  const handleLanguageSelect = (value: string) => {
    if (value && value !== "select") {
      const defaults = defaultPlaceholder[value as keyof typeof defaultPlaceholder];
      setValue("language", value, { shouldValidate: true });
      setValue("placeholder", defaults.placeholder, { shouldValidate: true });
      setValue("code", defaults.code, { shouldValidate: true });
      setValue("template", defaults.template, { shouldValidate: true });
    }
  };

  const addLanguage = async (data: LanguageFormData) => {
    if (!selectedProblem) return setError("Please select or create a problem first.");
    const langDefaults = defaultPlaceholder[data.language as keyof typeof defaultPlaceholder] || {
      placeholder: "// Write your solution here\n",
      code: "// Add validation logic here\n",
      template: "// Template code here\n",
    };
    try {
      setLoading(true);
      await handleApiCall("post", "/language", {
        problem_id: selectedProblem.problem_id,
        language: data.language,
        validation_code: {
          placeholder: data.placeholder || langDefaults.placeholder,
          code: data.code || langDefaults.code,
          template: data.template || langDefaults.template,
        },
      });
      setLanguages([
        ...languages,
        {
          language: data.language,
          placeholder: data.placeholder || langDefaults.placeholder,
          code: data.code || langDefaults.code,
          template: data.template || langDefaults.template,
        },
      ]);
      reset();
      setSuccess("Language added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to add language");
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (data: LanguageFormData) => {
    if (!selectedProblem) return setError("Please select a problem first.");
    try {
      setLoading(true);
      await handleApiCall("put", "/language", {
        problem_id: selectedProblem.problem_id,
        language: data.language,
        validation_code: {
          placeholder: data.placeholder,
          code: data.code,
          template: data.template,
        },
      });
      setLanguages(languages.map((lang) =>
        lang.language === data.language ? { ...data } : lang
      ));
      setSelectedLanguage(null);
      reset();
      setSuccess("Language updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update language");
    } finally {
      setLoading(false);
    }
  };

  const removeLanguage = async (language: string) => {
    if (!selectedProblem || !window.confirm(`Are you sure you want to remove ${formatLanguageName(language)} support?`)) return;
    try {
      setLoading(true);
      await handleApiCall("delete", "/language", { problem_id: selectedProblem.problem_id, language });
      setLanguages(languages.filter((lang) => lang.language !== language));
      if (selectedLanguage?.language === language) {
        reset();
        setSelectedLanguage(null);
      }
      setSuccess("Language removed successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to remove language");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLanguage = (lang: LanguageSupport) => {
    setSelectedLanguage(lang);
    setHandleViewLan(false)
    setValue("language", lang.language, { shouldValidate: true });
    setValue("placeholder", lang.placeholder, { shouldValidate: true });
    setValue("code", lang.code, { shouldValidate: true });
    setValue("template", lang.template || "", { shouldValidate: true });
  };

  const handleViewLanguage = (lang: LanguageSupport) => {
    setSelectedLanguage(lang);
    setHandleViewLan(true)
    setValue("language", lang.language, { shouldValidate: true });
    setValue("placeholder", lang.placeholder, { shouldValidate: true });
    setValue("code", lang.code, { shouldValidate: true });
    setValue("template", lang.template || "", { shouldValidate: true });
  };

  const [handleViewLan, setHandleViewLan] = useState(false)
  const toggleTemplateFullScreen = () => setIsTemplateFullScreen(!isTemplateFullScreen);
  const togglePlaceholderFullScreen = () => setIsPlaceholderFullScreen(!isPlaceholderFullScreen);
  const toggleCodeFullScreen = () => setIsCodeFullScreen(!isCodeFullScreen);

  return (
    <div>
      {!(isTemplateFullScreen || isPlaceholderFullScreen || isCodeFullScreen) && (
        <>
          <div className="mb-6 flex items-center gap-2 justify-between">
            {/* <div className="flex flex-row gap-5"> */}
            <Button
              variant="outline"
              onClick={() => setView("list")}
              className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedProblem?.title || "No problem selected"}
            </h1>
            {/* </div> */}

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Supported Languages</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Languages available for this problem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {languages.length > 0 ? (
                    <div className="space-y-2">
                      {languages.map((lang) => (
                        <div
                          key={lang.language}
                          className="flex justify-between items-center p-3 rounded-md border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {getLanguageIcon(lang.language)}
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {formatLanguageName(lang.language)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLanguage(lang)}
                              disabled={loading}
                              className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLanguage(lang)}
                              disabled={loading}
                              className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLanguage(lang.language)}
                              disabled={loading}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-gray-200 dark:border-[#1F1F23]"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                  ) : (
                    <div className="py-8 text-center">
                      <CodeIcon className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-400">No languages configured yet.</p>
                    </div>
                  )}

                  {!selectedLanguage && (
                    <div className="mt-4">
                      <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">
                        Add New Language
                      </Label>
                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleLanguageSelect(value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] text-gray-900 dark:text-gray-100">
                              <SelectItem value="select">Select a language</SelectItem>
                              {["python", "javascript", "cpp", "go"]
                                .filter((lang) => !languages.some((l) => l.language === lang))
                                .map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {formatLanguageName(lang)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.language && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.language.message}</p>
                      )}
                    </div>

                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    {!handleViewLan
                      ? selectedLanguage
                        ? `Edit ${formatLanguageName(selectedLanguage.language)}`
                        : "Configure Language"
                      : "View Language"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {!handleViewLan &&
                      (selectedLanguage
                        ? "Update language settings"
                        : "Add code templates and validation")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(selectedLanguage ? updateLanguage : addLanguage)} className="space-y-4">
                    <div className="flex gap-3">
                      {!handleViewLan && <Button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                      >
                        {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {selectedLanguage ? "Update Language" : "Add Language"}
                      </Button>}
                      {
                        !handleViewLan && selectedLanguage && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // reset();
                              setSelectedLanguage(null);
                            }}
                            disabled={isSubmitting || loading}
                            className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                          >
                            Cancel
                          </Button>
                        )
                      }
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="template" className="text-gray-700 dark:text-gray-300">
                          Template Code
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleTemplateFullScreen}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          {isTemplateFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Controller
                        name="template"
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height={isTemplateFullScreen ? "100vh" : "150px"}
                            width={isTemplateFullScreen ? "100vw" : "100%"}
                            language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                            value={field.value}
                            onChange={(value) => field.onChange(value || "")}
                            className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isTemplateFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              folding: false,
                              lineNumbers: "on",
                              glyphMargin: false,
                              renderValidationDecorations: "off",
                              hover: { enabled: false },
                              quickSuggestions: false,
                              codeLens: false,
                              readOnly: handleViewLan
                            }}
                          />
                        )}
                      />
                      {errors.template && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.template.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="placeholder" className="text-gray-700 dark:text-gray-300">
                          Placeholder Code
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlaceholderFullScreen}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          {isPlaceholderFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Controller
                        name="placeholder"
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height={isPlaceholderFullScreen ? "100vh" : "150px"}
                            width={isPlaceholderFullScreen ? "100vw" : "100%"}
                            language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                            value={field.value}
                            onChange={(value) => field.onChange(value || "")}
                            className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isPlaceholderFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              folding: false,
                              lineNumbers: "on",
                              glyphMargin: false,
                              renderValidationDecorations: "off",
                              hover: { enabled: false },
                              quickSuggestions: false,
                              codeLens: false,
                              readOnly: handleViewLan

                            }}

                          />
                        )}

                      />
                      {errors.placeholder && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.placeholder.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                          Validation Code
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleCodeFullScreen}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          {isCodeFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Controller
                        name="code"
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height={isCodeFullScreen ? "100vh" : "150px"}
                            width={isCodeFullScreen ? "100 provincie%" : "100%"}
                            language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                            value={field.value}
                            onChange={(value) => field.onChange(value || "")}
                            className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isCodeFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              folding: false,
                              lineNumbers: "on",
                              glyphMargin: false,
                              renderValidationDecorations: "off",
                              hover: { enabled: false },
                              quickSuggestions: false,
                              codeLens: false,
                              readOnly: handleViewLan

                            }}
                          />
                        )}
                      />
                      {errors.code && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.code.message}</p>
                      )}
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {isTemplateFullScreen && (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Template Code Editor</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTemplateFullScreen}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>
          <Controller
            name="template"
            control={control}
            render={({ field }) => (
              <Editor
                height="calc(100vh - 48px)"
                width="100vw"
                language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                value={field.value}
                onChange={(value) => field.onChange(value || "")}
                className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  folding: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  renderValidationDecorations: "off",
                  hover: { enabled: false },
                  quickSuggestions: false,
                  codeLens: false,
                  readOnly: handleViewLan

                }}
              />
            )}
          />
        </div>
      )}

      {isPlaceholderFullScreen && (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Placeholder Editor</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlaceholderFullScreen}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>
          <Controller
            name="placeholder"
            control={control}
            render={({ field }) => (
              <Editor
                height="calc(100vh - 48px)"
                width="100vw"
                language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                value={field.value}
                onChange={(value) => field.onChange(value || "")}
                className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  folding: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  renderValidationDecorations: "off",
                  hover: { enabled: false },
                  quickSuggestions: false,
                  codeLens: false,
                }}
              />
            )}
          />
        </div>
      )}

      {isCodeFullScreen && (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Code Editor</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCodeFullScreen}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Editor
                height="calc(100vh - 48px)"
                width="100vw"
                language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                value={field.value}
                onChange={(value) => field.onChange(value || "")}
                className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  folding: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  renderValidationDecorations: "off",
                  hover: { enabled: false },
                  quickSuggestions: false,
                  codeLens: false,
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
};

export default LanguagesView;