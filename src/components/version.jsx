import { version } from "../../package.json";
import "./version.css";

const Version = () => <div className="version">version: {version}</div>;

export default Version;
