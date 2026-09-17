import { createContext, useContext } from 'react'

export type ShowToast = (message: string) => void

export const ToastContext = createContext<ShowToast>(() => undefined)

export function useToast(): ShowToast {
  return useContext(ToastContext)
}