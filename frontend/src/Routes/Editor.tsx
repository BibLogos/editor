import { Annot } from "../Components/Annot"
import type { SelectionEvent } from '../Components/Annot'
import { useParams } from "react-router-dom"
import { projects } from "../Services/Projects"
import { useEffect } from "react"

const createSelection = (event: SelectionEvent) => {
  const { start, end, highlight, text } = event
  highlight.addHighlight(start, end)
  text.clearCursors()
}

export default function Editor() {
  const { 
    ownerId,
    repoId,
    bookId,
    chapterId
  } = useParams()

  useEffect(() => {
    projects.getProject(ownerId!, repoId!).then(async (project) => {
      console.log(project.books)
    })
  }, [])

  return (
    <>
    <h1>test</h1>

    <Annot onSelection={createSelection}>

      <p data-chapter="1">Curabitur volutpat dignissim nulla, a interdum neque interdum eget. Quisque sit amet est sit amet quam blandit tincidunt. Curabitur ac sodales justo, nec laoreet nulla.</p>
        
      <p data-chapter="2">Lorem ipsum dolor <strong>sit amet</strong>, consectetur <em>adipiscing elit. </em> blandit mollis magna.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non arcu eleifend, dictum turpis aliquet, scelerisque risus. Cras id viverra enim. Donec in nisi sit amet diam aliquam ultrices sit amet a nibh. Aenean libero elit, euismod in accumsan sit amet, pellentesque et mauris. Praesent nec dapibus nulla. Phasellus bibendum ante sed magna sodales, eget pharetra libero varius. Vivamus suscipit neque et sem lobortis imperdiet. Integer ut pellentesque ex. Fusce diam odio, pulvinar tincidunt neque eget, accumsan aliquam turpis. Curabitur volutpat dignissim nulla, a interdum neque interdum eget. Quisque sit amet est sit amet quam blandit tincidunt. Curabitur ac sodales justo, nec laoreet nulla. </p>

    </Annot>

    </>
  )
}
