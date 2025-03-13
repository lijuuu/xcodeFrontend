import React, { useState } from "react";

interface Problem {
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  cases: Case[];
}

type Case = {
  type: "sample" | "hidden";
  input: number[];
  output: number;
};

const AddProblems = () => {
  const [problem, setProblem] = useState<Problem>({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    cases: [],
  });

  const [caseType, setCaseType] = useState<"sample" | "hidden">("sample");
  const [caseInput, setCaseInput] = useState<string>("");
  const [caseOutput, setCaseOutput] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProblem({
      ...problem,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCase = () => {
    try {
      const parsedInput = JSON.parse(caseInput);
      const parsedOutput = JSON.parse(caseOutput);

      if (!Array.isArray(parsedInput) || typeof parsedOutput !== "number") {
        throw new Error("Invalid format");
      }

      const newCase: Case = {
        type: caseType,
        input: parsedInput,
        output: parsedOutput,
      };

      setProblem({
        ...problem,
        cases: [...problem.cases, newCase],
      });

      setCaseInput("");
      setCaseOutput("");
    } catch (error) {
      alert("Invalid JSON input/output. Example:\nInput: [1,2,3]\nOutput: 6");
    }
  };

  const handleSubmit = () => {
    console.log("Problem Submitted:", problem);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 shadow-lg rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Add Problem</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          value={problem.title}
          onChange={handleChange}
          placeholder="Problem Name"
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <textarea
          name="statement"
          value={problem.statement}
          onChange={handleChange}
          placeholder="Problem Statement"
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="inputFormat"
          value={problem.inputFormat}
          onChange={handleChange}
          placeholder="Input Format"
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="outputFormat"
          value={problem.outputFormat}
          onChange={handleChange}
          placeholder="Output Format"
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="constraints"
          value={problem.constraints}
          onChange={handleChange}
          placeholder="Constraints"
          className="border p-2 rounded bg-gray-800 text-white"
        />

        {/* Add Test Cases */}
        <div className="p-4 bg-gray-700 rounded">
          <h3 className="text-lg font-semibold">Test Cases</h3>
          <select
            className="border p-2 rounded bg-gray-800 text-white mt-2"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as "sample" | "hidden")}
          >
            <option value="sample">Sample Case</option>
            <option value="hidden">Hidden Case</option>
          </select>
          <textarea
            value={caseInput}
            onChange={(e) => setCaseInput(e.target.value)}
            placeholder='Input (JSON) e.g. [1,2,3]'
            className="border p-2 rounded bg-gray-800 text-white mt-2"
          />
          <input
            type="text"
            value={caseOutput}
            onChange={(e) => setCaseOutput(e.target.value)}
            placeholder='Output (JSON) e.g. 6'
            className="border p-2 rounded bg-gray-800 text-white mt-2"
          />
          <button
            onClick={handleAddCase}
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Add Case
          </button>
        </div>

        {/* Display Added Cases */}
        {problem.cases.length > 0 && (
          <div className="p-4 bg-gray-800 rounded mt-4">
            <h3 className="text-lg font-semibold">Added Cases</h3>
            <ul className="list-disc pl-5">
              {problem.cases.map((c, index) => (
                <li key={index} className="text-gray-300">
                  <strong>{c.type.toUpperCase()}:</strong> Input: {JSON.stringify(c.input)}, Output: {c.output}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddProblems;
