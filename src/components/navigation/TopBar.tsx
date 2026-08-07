import { ReactNode } from "react";
import "./TopBar.css";

interface TopBarProps {
  children?: ReactNode;
}

export default function TopBar({ children }: TopBarProps) {
  return (
    <div className="top-bar">
      {children}
    </div>
  );
}