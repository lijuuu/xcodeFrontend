import { File } from '@/pages/compiler/compiler-main';

// src/actions.ts
export const SET_CODE = 'SET_CODE';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_LOADING = 'SET_LOADING';
export const SET_RESULT = 'SET_RESULT';
export const SET_FILES = 'SET_FILES';
export const SET_CURRENT_FILE = 'SET_CURRENT_FILE';
export const SET_RENAMING = 'SET_RENAMING';
export const SET_NEW_FILE_NAME = 'SET_NEW_FILE_NAME';
export const SET_FILE_TO_RENAME = 'SET_FILE_TO_RENAME';


export const setCode = (code: string) => ({ type: SET_CODE, payload: code });
export const setLanguage = (language: string) => ({ type: SET_LANGUAGE, payload: language });
export const setLoading = (loading: boolean) => ({ type: SET_LOADING, payload: loading });
export const setResult = (result: any) => ({ type: SET_RESULT, payload: result });
export const setFiles = (files: File[]) => ({ type: SET_FILES, payload: files });
export const setCurrentFile = (currentFile: string | null) => ({ type: SET_CURRENT_FILE, payload: currentFile });
export const setRenaming = (isRenaming: boolean) => ({ type: SET_RENAMING, payload: isRenaming });
export const setNewFileName = (newFileName: string) => ({ type: SET_NEW_FILE_NAME, payload: newFileName });
export const setFileToRename = (fileToRename: string | null) => ({ type: SET_FILE_TO_RENAME, payload: fileToRename });