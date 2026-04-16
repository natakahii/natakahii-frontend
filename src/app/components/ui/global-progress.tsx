import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { createPortal } from "react-dom";

export function GlobalProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (navigation.state === "loading") {
      setVisible(true);
      setProgress(10);
      
      // Simulate progress
      timeoutId = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(timeoutId);
            return 90;
          }
          return p + 10;
        });
      }, 200);
    } else if (navigation.state === "idle" && visible) {
      // Complete
      setProgress(100);
      
      // Hide after complete
      timeoutId = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    };
  }, [navigation.state, visible]);

  if (typeof document === "undefined" || !visible) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
      <div 
        className="h-full bg-[#F05A28] shadow-[0_0_10px_#F05A28] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>,
    document.body
  );
}
