import { createContext, useContext } from "react";

export const AccordionBackofficeContext = createContext(null);

export function useAccordionBackoffice() {
  return useContext(AccordionBackofficeContext);
}
