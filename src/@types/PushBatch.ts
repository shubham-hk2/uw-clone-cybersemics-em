import Index from './IndexType'
import Lexeme from './Lexeme'
import Path from './Path'
import RecentlyEditedTree from './RecentlyEditedTree'
import Thought from './Thought'
import ThoughtId from './ThoughtId'

/** Defines a single batch of updates added to the push queue. */
interface PushBatch {
  // callback for when the updates have been synced with IDB
  idbSynced?: () => void
  lexemeIndexUpdates: Index<Lexeme | null>
  // Update the local device. Default: true.
  // If local and remote are false, null updates will still cause the YJS providers to be destroyed to free up memory.
  // In particular, this is used by the freeThoughts middleware.
  local?: boolean
  // contains the path of the pending thought to be deleted and all its siblings. Siblings may be resurrected from the pull, and the parent has already been deleted, so we need to store them to be deleted in flushDeletes.
  pendingDeletes?: { path: Path; siblingIds: ThoughtId[] }[]
  recentlyEdited?: RecentlyEditedTree
  // Update the remote server. Default: true.
  // Set to false to free memory (See: local)
  remote?: boolean
  thoughtIndexUpdates: Index<Thought | null>
  // arbitrary updates: use with caution!
  updates?: Index<any>
}

export default PushBatch
