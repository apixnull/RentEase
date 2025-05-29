import { toast } from "sonner";

export default function App() {
  return (
    <>
      <button onClick={() => toast("Normal message")}>Normal</button>
      <button onClick={() => toast.success("Success message")}>Success</button>
      <button onClick={() => toast.warning("Warning message")}>Warning</button>
      <button onClick={() => toast.error("Error message")}>Error</button>
    </>
  );
}
