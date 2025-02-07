import { useState, useEffect } from 'react';

const TUTORIAL_COMPLETED_KEY = 'tutorial_completed';

export const useTutorial = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!hasCompletedTutorial) {
      setIsFirstVisit(true);
      setIsTutorialOpen(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setIsTutorialOpen(false);
    setIsFirstVisit(false);
  };

  const startTutorial = () => {
    setIsTutorialOpen(true);
  };

  return {
    isFirstVisit,
    isTutorialOpen,
    completeTutorial,
    startTutorial
  };
};

export default useTutorial;