import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { PianoController } from "./components/PianoController";
import { URL_PREFIX } from "./constants/routes";
import "./styles/keyboard.css";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={`/:taskId`} element={<PianoController />} />
        <Route path="/" element={<Navigate to="/0" replace />} />
        <Route path="*" element={<Navigate to="/0" replace />} />
      </Routes>
    </HashRouter>
  );
}
