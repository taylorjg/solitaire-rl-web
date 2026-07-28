import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "@app/components/navigation";
import ManualPlayView from "@app/views/manual-play-view";
import AgentPlayView from "@app/views/agent-play-view";
import TrainingView from "@app/views/training-view";
import Version from "@app/components/version";
import { ROUTES } from "./routes";
import "./app.css";

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
