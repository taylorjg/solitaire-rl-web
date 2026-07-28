import { version } from '../package.json'
import './Version.css'

const Version = () =>
  <div className="version">version: {version}</div>

export default Version
