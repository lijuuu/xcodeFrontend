// src/store.ts
import { createStore } from 'redux';
import rootReducer from '@/pages/Compiler/redux/reducers';

const store = createStore(rootReducer);

export default store;