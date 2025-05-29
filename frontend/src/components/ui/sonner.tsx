import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "text-base px-6 py-4 rounded shadow font-semibold",
        },
        duration: 5000,
      }}
      {...props}
    />
  )
}

export { Toaster }
