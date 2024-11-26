import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PianoController } from "./components/PianoController";
import "./styles/keyboard.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/layouts/:taskId" element={<PianoController />} />
        <Route path="/layouts" element={<Navigate to="/layouts/0" replace />} />
        <Route path="*" element={<Navigate to="/layouts/0" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
