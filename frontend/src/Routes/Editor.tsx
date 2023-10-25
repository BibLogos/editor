import { Annot } from "../Components/Annot"
import type { SelectionEvent } from '../Components/Annot'
import { useNavigate, useParams } from "react-router-dom"
import { Project } from "../Models/Project"
import { useEffect, useState } from "react"
import { Chapter } from "../../types"
import namespace from '@rdfjs/namespace'

const biblogos = namespace('https://biblogos.info/ttl/ontology#')
const rdf = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

const createSelection = (event: SelectionEvent) => {
  const { start, end, highlight, text } = event
  highlight.addHighlight(start, end)
  text.clearCursors()
}

export default function Editor() {
  const { ownerId, repoId, bookId, chapterId } = useParams()
  const [text, setText] = useState<Array<Chapter>>([])
  const [highlights, setHighlights] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const project = new Project(ownerId!, repoId!)
    project.fetch().then(async (books) => {
      if (!bookId) {
        const bookId = books[0].options.book
        const selectedBook = books.find(book => book.options.book === bookId)
        const chapterId = (await selectedBook!.getChapters())[0][0]
        navigate(`/editor/${ownerId}/${repoId}/${bookId}/${chapterId}`)
      }

      if (chapterId) {
        const selectedBook = books.find(book => book.options.book === bookId)
        const text = await selectedBook?.getText(chapterId)
        if (text) setText(text)

        const { file } = selectedBook!.options.files[0]
        const pointer = await project.getPointer(file)
        const objects = pointer
          .clone([rdf('type')])
          .hasOut([biblogos('reference')])

        for (const object of objects) {
          const references = object.out([biblogos('reference')]).values
          const comment = object.out([biblogos('comment')]).value
          const type = object.out([rdf('type')]).value

          console.log(references, comment, type)
        }

      }      
    })
  }, [ navigate, ownerId, repoId, bookId, chapterId ])

  return <Annot onSelection={createSelection}>
      {text.length ? text.map(([number, line]) => <p key={number.toString()} data-number={number}>{line}</p>) : null}
    </Annot>
}
