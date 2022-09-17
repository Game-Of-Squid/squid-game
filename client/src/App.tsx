import React from "react";
import "./App.css";
import { MemoryRouter } from "react-router";
import { Routes, Route } from "react-router-dom";
import Game from "./components/Game";
import StartPage from "./components/StartPage";

const App: React.FC = () => {
  const initialSearchParam = new URLSearchParams(window.location.search);
  const initialPath = initialSearchParam.get("path") || "/";

  return (
    <MemoryRouter initialEntries={["/", initialPath]}>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;
