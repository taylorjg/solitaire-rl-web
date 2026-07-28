import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "@app/components/Navigation";
import ManualPlayView from "@app/components/ManualPlayView";
import AgentPlayView from "@app/components/AgentPlayView";
import TrainingView from "@app/components/TrainingView";
import Version from "@app/components/Version";
import { ROUTES } from "./routes";
import "./App.css";

const App = () => {
  return (
    <HashRouter>
      <div className="app-layout">
        <Navigation />
        <div className="app-layout-content">
          <Routes>
            <Route path={ROUTES.manualPlayView} element={<ManualPlayView />} />
            <Route path={ROUTES.agentPlayView} element={<AgentPlayView />} />
            <Route path={ROUTES.trainingView} element={<TrainingView />} />
            <Route
              path={ROUTES.home}
              element={<Navigate to={ROUTES.agentPlayView} replace />}
            />
          </Routes>
        </div>
        <Version />
      </div>
    </HashRouter>
  );
};

export default App;
