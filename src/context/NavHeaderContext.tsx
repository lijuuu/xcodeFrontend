import {createContext,useContext,useState,ReactNode} from "react";

interface NavHeaderContextType{
  currentPage:string;
  setCurrentPage:(page:string) =>void;

}
const NavHeaderContext = createContext<NavHeaderContextType | undefined>(undefined)