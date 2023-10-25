import { useEffect, useRef } from "react"
import 'annot'

export type SelectionEvent = { 
    start: number, 
    end: number ,
    text: any,
    highlight: any
}

type Props = { 
    onSelection?: (event: SelectionEvent) => void, 
    onClick?: (event: CustomEvent<string>) => void,
    children: any
}

type CustomHTMLElement<T extends string> = HTMLElement & {
    addEventListener(type: T, listener: (this: HTMLElement, ev: CustomEvent) => unknown, options?: boolean | AddEventListenerOptions | undefined): void
    removeEventListener(type: T, listener: (this: HTMLElement, ev: CustomEvent) => unknown, options?: boolean | AddEventListenerOptions | undefined): void
}

export function Annot ({ onSelection, onClick, children }: Props) {

    const highlightRef = useRef<CustomHTMLElement<'click-highlight'>>(null)
    const textRef = useRef<CustomHTMLElement<'selection'>>(null)

    useEffect(() => {
        const onSelectionHandler = (event: CustomEvent) => { onSelection ? onSelection({
            ...(event as CustomEvent).detail,
            highlight: highlightRef.current,
            text: textRef.current
        }) : null }
        const onClickHandler = (event: CustomEvent) => { onClick ? onClick(event) : null }

        if (highlightRef.current && textRef.current) {
            textRef.current.addEventListener('selection', onSelectionHandler)    
            highlightRef.current.addEventListener('click-highlight', onClickHandler)
        }

        return () => {
            textRef.current?.removeEventListener('selection', onSelectionHandler)    
            highlightRef.current?.removeEventListener('click-highlight', onClickHandler)    
        }
    }, [])

    return <annot-highlight ref={highlightRef}>
        <annot-text ref={textRef}>
            {children}
        </annot-text>
    </annot-highlight>
}