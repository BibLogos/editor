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
    onClick?: (event: CustomEvent<any>) => void,
    children: any
}

export function Annot ({ onSelection, onClick, children }: Props) {

    const highlightRef = useRef<any>(null)
    const textRef = useRef<any>(null)

    useEffect(() => {
        const onSelectionHandler = (event: CustomEvent) => { onSelection ? onSelection({
            ...(event as any).detail,
            highlight: highlightRef.current,
            text: textRef.current
        }) : null }
        const onClickHandler = (event: CustomEvent) => { onClick ? onClick(event) : null }

        if (highlightRef.current && textRef.current) {
            textRef.current.addEventListener('selection', onSelectionHandler)    
            highlightRef.current.addEventListener('click-highlight', onClickHandler)    
        }

        return () => {
            textRef.current.removeEventListener('selection', onSelectionHandler)    
            highlightRef.current.removeEventListener('click-highlight', onClickHandler)    
        }
    }, [])

    return <annot-highlight ref={highlightRef}>
        <annot-text ref={textRef}>
            {children}
        </annot-text>
    </annot-highlight>
}