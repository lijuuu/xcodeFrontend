import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';

// Schema definition
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
});

type ProblemFormData = z.infer<typeof problemSchema>;

// Problem interface
interface Problem {
  problem_id: string | number;
  title: string;
  description: string;
  tags: string[];
  difficulty: string ;
}

// Props interface for ProblemDetailsView
interface ProblemDetailsProps {
  selectedProblem: Problem | null;
  setView: any
  handleApiCall: (
    method: "post" | "put" | "delete",
    url: string,
    data: any | null,
    params?: Record<string, any>
  ) => Promise<void>;
  loading: boolean;
  setSelectedProblem: (problem: Problem | null) => void;
}

// MultiSelect component props
interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: { value: string; label: string }[];
  onChange: (selected: { value: string; label: string }[]) => void;
  placeholder: string;
  className: string;
  errors?: any;
}

const predefinedTags = [
  "Array", "String", "Dynamic Programming", "Graph", "Tree", 
  "Linked List", "Stack", "Queue", "Heap", "Backtracking", 
  "Greedy", "Binary Search", "Sorting", "Recursion", "Bit Manipulation"
];

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  className, 
  errors 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = options.filter(
    (option) => !selected.find((s) => s.value === option.value) && 
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="relative">
      <div className={className} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
          {selected.map((item) => (
            <span 
              key={item.value} 
              className="flex items-center gap-1 px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 rounded"
            >
              {item.label}
              <button 
                type="button" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onChange(selected.filter((s) => s.value !== item.value)); 
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
          <div className="p-2">
            <Input 
              placeholder="Search..." 
              value={searchValue} 
              onChange={(e) => setSearchValue(e.target.value)} 
              onClick={(e) => e.stopPropagation()} 
              className="border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" 
            />
          </div>
          <ul className="max-h-60 overflow-auto p-2">
            {filteredOptions.length === 0 && 
              <li className="px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-400">No options found</li>
            }
            {filteredOptions.map((option) => (
              <li 
                key={option.value} 
                className="cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onChange([...selected, option]); 
                  setSearchValue(""); 
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const mapDifficulty = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
    "E": "Easy",
    "M": "Medium",
    "H": "Hard"
  };
  return difficultyMap[difficulty] || difficulty;
};

// Problem Details View
const ProblemDetailsView: React.FC<ProblemDetailsProps> = ({
  selectedProblem,
  setView,
  handleApiCall,
  loading,
  setSelectedProblem
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: selectedProblem
      ? {
          title: selectedProblem.title,
          description: selectedProblem.description,
          tags: selectedProblem.tags || [],
          difficulty: mapDifficulty(selectedProblem.difficulty),
        }
      : { title: "", description: "", tags: [], difficulty: "" },
  });

  useEffect(() => {
    if (selectedProblem) {
      reset({
        title: selectedProblem.title,
        description: selectedProblem.description,
        tags: selectedProblem.tags || [],
        difficulty: mapDifficulty(selectedProblem.difficulty),
      });
    } else {
      reset({ title: "", description: "", tags: [], difficulty: "" });
    }
  }, [selectedProblem, reset]);

  const onSubmit = async (data: ProblemFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      tags: data.tags,
      difficulty: data.difficulty.charAt(0),
    };
    if (selectedProblem) {
      await handleApiCall("put", "/", { problem_id: selectedProblem.problem_id, ...payload });
    } else {
      await handleApiCall("post", "/", payload);
    }
    setView("list");
  };

  const onDelete = async () => {
    if (selectedProblem && window.confirm("Are you sure you want to delete this problem?")) {
      await handleApiCall("delete", "/", null, { problem_id: selectedProblem.problem_id });
      setSelectedProblem(null);
      setView("list");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setView("list")}
          className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedProblem ? "Edit Problem" : "Create Problem"}
        </h1>
      </div>

      <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            {selectedProblem ? "Edit Problem Details" : "Create New Problem"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {selectedProblem ? "Update the problem details" : "Add a new coding problem"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter problem title"
                  className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">
                    Difficulty
                  </label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={mapDifficulty(field.value)}>
                        <SelectTrigger className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] text-gray-900 dark:text-gray-100">
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.difficulty && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.difficulty.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tags" className="text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        options={predefinedTags.map((tag) => ({ value: tag, label: tag }))}
                        selected={field.value.map((tag) => ({ value: tag, label: tag })) || []}
                        onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                        placeholder="Select tags..."
                        className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                      />
                    )}
                  />
                  {errors.tags && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.tags.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  defaultValue={selectedProblem?.description || ""}
                  render={({ field }) => (
                    <MDEditor
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      textareaProps={{
                        placeholder: "Please enter Markdown text",
                        maxLength: 1000,
                      }}
                      className="mt-1 min-h-32 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedProblem ? "Update Problem" : "Create Problem"}
              </Button>
              {selectedProblem && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSubmitting || loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setView("list")}
                className="ml-auto border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemDetailsView;