declare module '@excalidraw/excalidraw' {
  import { ComponentType } from 'react'

  interface ExcalidrawElement {
    id: string
    [key: string]: unknown
  }

  interface ExcalidrawProps {
    initialData?: { elements?: ExcalidrawElement[] }
    onChange?: (elements: readonly ExcalidrawElement[]) => void
    isCollaborating?: boolean
    theme?: 'dark' | 'light'
    UIOptions?: {
      canvasActions?: {
        saveAsImage?: boolean
        export?: boolean
      }
    }
  }

  export const Excalidraw: ComponentType<ExcalidrawProps>
}
