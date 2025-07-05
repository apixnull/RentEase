import { Outlet } from "react-router-dom"
import Footer from "./publicComponents/Footer"
import Navbar from "./publicComponents/Navbar"

const PublicLayout = () => {
  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    </>
  )
}

export default PublicLayout