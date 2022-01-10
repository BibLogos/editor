import { github } from "../Services/Github"
import { env } from '../Core/Env'
import { Project } from "../Classes/Project"
import { hash } from "./sha1"

export async function saveChanges (project: Project, params, turtle) {
  const book = project.books.find(book => book.name === params.bookId)
  const bookCid = hash(JSON.stringify(params))

  // Redundant ensuring of a Github session.
  if (! (await github.isLoggedIn())) {
    const redirectUrl = `${env.API}/login`
    localStorage.redirectUrl = location.pathname
    location.replace(redirectUrl)
  }

  const commitData = [{
    // TODO make multiple files work.
    file: book.settings.files[0].file,
    content: turtle
  }]
  
  // If the user is a collaborator on the source repository, save it directly.
  if (project.hasWriteAccess) {
    await github.createCommit(params.ownerId, params.repoId, project.branch, commitData)  
  }
  else {
    const user = await github.getCurrentUser()
    let forkRepo = await github.getForkRepo(params.ownerId, user.login, params.repoId)

    // Ensure a fork of the source repo for the current user.
    if (!forkRepo) {
      const forkCreateResponse = await github.createForkRepo(params.ownerId, params.repoId)
      forkRepo = forkCreateResponse.data
      if (!forkRepo) throw new Error('Could not fork the repo')
    }

    const branchName = 'biblogos-' + hash(turtle)
    await github.createBranchOnFork(user.login, params.ownerId, params.repoId, branchName)
    const { data: commit } = await github.createCommit(user.login, params.repoId, branchName, commitData)  
    await github.createMergeRequest(user.login, params.ownerId, params.repoId, branchName, commit.object.sha)
  }

  delete localStorage[bookCid]
  return true
}