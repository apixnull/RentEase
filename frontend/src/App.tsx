import { Toaster } from "sonner"
import Routes from "./Routes"


const App = () => {
  return (
    <>
     <Routes />
     <Toaster
        position="top-center"
        theme="system"
        duration={4000}
        closeButton
        offset={40}
        expand
        visibleToasts={2}
        richColors
      />
    </>
  )
}

export default App