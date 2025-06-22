import { toast } from "sonner";
import Navbar from "./components/public/Navbar";

function App() {
  return (
    <>


      {/* Other components */}
      <Navbar />
      <div className="space-y-2">
        <button onClick={() => toast.success("Success! Everything worked.")}>
          Show Success
        </button>

        <button onClick={() => toast.error("Oops! Something went wrong.")}>
          Show Error
        </button>

        <button onClick={() => toast.warning("Careful! Check this out.")}>
          Show Warning
        </button>

        <button onClick={() => toast.info("Heads up! Just so you know.")}>
          Show Info
        </button>

        <button
          onClick={() => {
            const id = toast.loading("Loading...");
            setTimeout(() => {
              toast.success("Loaded!", { id });
            }, 2000);
          }}
        >
          Show Loading
        </button>
      </div>
    </>
  );
}

export default App;
