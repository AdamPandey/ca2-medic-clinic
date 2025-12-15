import { createContext, useContext, useState } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
  // Stores a map of paths to titles.
  const [labels, setLabels] = useState({});

  const setBreadcrumb = (path, title) => {
    setLabels(prev => ({ ...prev, [path]: title }));
  };

  return (
    <BreadcrumbContext.Provider value={{ labels, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);