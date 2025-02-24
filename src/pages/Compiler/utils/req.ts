import axios from 'axios';
import { setLoading, setResult, setFiles } from '@/pages/Compiler/redux/actions';
import { Response } from '@/pages/Compiler/compiler-main';

export const handleRequest = async (dispatch: any, code: string, reqLang: string) => {
  dispatch(setLoading(true));
  dispatch(setResult({ output: '', status_message: '', success: false }));


  if (reqLang == "") {
    console.log("No language selected");
    return;
  }

  try {
    const response = await axios.post('https://xengine.lijuu.me/execute', {
      code: btoa(code),
      language: reqLang,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = response.data as Response;

    if (!responseData.success) {
      dispatch(setResult({
        output: responseData.output,
        status_message: responseData.error || 'An error occurred.',
        success: false,
        execution_time: responseData.execution_time,
      }));
    } else {
      dispatch(setResult({
        output: responseData.output,
        status_message: responseData.status_message,
        success: true,
        execution_time: responseData.execution_time,
      }));
    }
  } catch (error: any) {
    console.error("Error during request:", error);
    dispatch(setResult({
      output: error.response?.data?.output || '',
      error: error.response?.data?.error || '',
      status_message: error.response?.data?.error || 'An error occurred during execution.',
      success: false,
    }));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveCurrentFile = (dispatch: any, currentFile: string, code: string, files: any[]) => {
  if (!currentFile) return;

  const updatedFiles = files.map((file: any) =>
    file.id === currentFile
      ? { ...file, content: code, lastModified: new Date().toISOString() }
      : file
  );

  dispatch(setFiles(updatedFiles));
  localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
};

