import { github } from "../Services/Github"
import { env } from '../Core/Env'
import { Project } from "../Classes/Project"
import { hash } from "./sha1"

export async function saveChanges (project: Project, params, turtle) {
  const book = project.books.find(book => book.name === params.bookId)
  // TODO make multiple files work.

  // Redundant ensuring of a Github session.
  if (! (await github.isLoggedIn())) {
    const redirectUrl = `${env.API}/login`
    localStorage.redirectUrl = location.pathname
    location.replace(redirectUrl)
  }
  
  if (project.hasWriteAccess) {
    await github.createCommit(params.ownerId, params.repoId, project.branch, [
      {
        file: book.settings.files[0].file,
        content: turtle
      }
    ])  

    const id = hash(JSON.stringify(params))
    delete localStorage[id]

    return true
  }

  throw new Error('Implement forking flow.')
}