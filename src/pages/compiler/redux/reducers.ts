// src/reducers.ts
import { combineReducers } from 'redux';
import {
  SET_CODE,
  SET_LANGUAGE,
  SET_LOADING,
  SET_RESULT,
  SET_FILES,
  SET_CURRENT_FILE,
  SET_RENAMING,
  SET_NEW_FILE_NAME,
  SET_FILE_TO_RENAME,
} from '@/pages/compiler/redux/actions';

const initialState = {
  code: '',
  language: 'js',
  loading: false,
  result: {},
  files: [],
  currentFile: null,
  isRenaming: false,
  newFileName: '',
  fileToRename: null,
};

const appReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_CODE:
      return { ...state, code: action.payload };
    case SET_LANGUAGE:
      return { ...state, language: action.payload };
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_RESULT:
      return { ...state, result: action.payload };
    case SET_FILES:
      return { ...state, files: action.payload };
    case SET_CURRENT_FILE:
      return { ...state, currentFile: action.payload };
    case SET_RENAMING:
      return { ...state, isRenaming: action.payload };
    case SET_NEW_FILE_NAME:
      return { ...state, newFileName: action.payload };
    case SET_FILE_TO_RENAME:
      return { ...state, fileToRename: action.payload };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  app: appReducer,
});

export default rootReducer;