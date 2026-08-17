import React, { createContext, useContext, useState } from 'react';

type CopyReviewValue = {
  highlight: boolean;
  setHighlight: (value: boolean) => void;
};

const CopyReviewContext = createContext<CopyReviewValue>({
  highlight: false,
  setHighlight: () => undefined,
});

export function CopyReviewProvider({ children }: { children: React.ReactNode }) {
  const [highlight, setHighlight] = useState(false);

  return (
    <CopyReviewContext.Provider value={{ highlight, setHighlight }}>
      {children}
    </CopyReviewContext.Provider>
  );
}

export function useCopyReview() {
  return useContext(CopyReviewContext);
}
