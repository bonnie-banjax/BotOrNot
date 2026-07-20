import Telemetry from "./components/Telemetry";
// functions only to organize the page. which components belong to which page
function App() {
  return (
    <main>
      <h1>BotOrNot Risk Detection Dashboard</h1>

      <p>
        BotorNot collects browser and behavioral signals to demonstrate how a web
        application can evaluate whether a session appears human or automated.
      </p>

      <Telemetry />
    </main>
  );
}

export default App;