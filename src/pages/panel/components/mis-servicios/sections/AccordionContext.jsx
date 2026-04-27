import { createContext, useContext } from "react";

export const AccordionContext = createContext(null);

export function useAccordion() {
  return useContext(AccordionContext);
}
