import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider'
import * as murmurHash3 from 'murmurhash3js'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'
import Share from '../../@types/Share'
import createId from '../../util/createId'
import storage from '../../util/storage'
import { encodePermissionsDocumentName } from './documentNameEncoder'

const host = process.env.REACT_APP_WEBSOCKET_HOST || 'localhost'
const port = process.env.REACT_APP_WEBSOCKET_PORT || 3001
const protocol = host === 'localhost' ? 'ws' : 'wss'
// public host must end with '/' or the websocket connection will not open
export const websocketUrl = `${protocol}://${host}${host === 'localhost' || host.endsWith('/') ? '' : '/'}:${port}`

// stores the permissions for the entire thoughtspace as Index<Share> (indexed by access token)
// only accessible by owner
export const permissionsClientDoc = new Y.Doc()

// Define a secret access token for this device.
// Used to authenticate a connection to the y-websocket server.
export const accessTokenLocal = storage.getItem('accessToken', createId)

// Define a unique tsid (thoughtspace id) that is used as the default yjs doc id.
// This can be shared with ?share={docId} when connected to a y-websocket server.
export const tsidLocal = storage.getItem('tsid', createId)

// access a shared document when the URL contains share=DOCID&
// otherwise use the tsid stored on the device
export const tsidShared = new URLSearchParams(window.location.search).get('share')
const accessTokenShared = new URLSearchParams(window.location.search).get('auth')

export const tsid = tsidShared || tsidLocal
export const accessToken = accessTokenShared || accessTokenLocal

// make the clientId a hash of the access token for now so it can be public but linked back to the access token
export const clientId = murmurHash3.x64.hash128(accessToken)

// disable during tests because of TransactionInactiveError in fake-indexeddb
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-new
  new IndexeddbPersistence(encodePermissionsDocumentName(tsid), permissionsClientDoc)
}

// websocket provider
export const websocket = new HocuspocusProviderWebsocket({ url: websocketUrl })
export const websocketProviderPermissions = new HocuspocusProvider({
  websocketProvider: websocket,
  name: encodePermissionsDocumentName(tsid),
  document: permissionsClientDoc,
  token: accessToken,
})

// TODO: Separate thoughtspace websocket from permissions websocket to allow for connect/disconnect
export const websocketThoughtspace = websocket
// export const websocketThoughtspace = new HocuspocusProviderWebsocket({
//   url: websocketUrl,
//   // Do not auto connect. Connects in connectThoughtspaceProvider only when there is more than one device.
//   connect: false,
// })

// Reconnect on disconnect in order to mitigate a bug in Hocuspocus that causes idle connection timeouts.
// https://github.com/ueberdosis/hocuspocus/issues/566#issuecomment-1582525932
websocketThoughtspace.on('disconnect', () => {
  setTimeout(() => {
    console.warn('Reconnecting websocket')
    websocketThoughtspace.connect()
  })
})

/** If there is more than one device, connects the thoughtspace Websocket provider. */
const connectThoughtspaceProvider = () => {
  if (permissionsClientMap.size > 1) {
    websocketThoughtspace.connect()
  }
}
const permissionsClientMap = permissionsClientDoc.getMap<Share>()
// indexeddbProviderPermissions.whenSynced.then(connectThoughtspaceProvider)
permissionsClientMap.observe(connectThoughtspaceProvider)

// If the local thoughtspace is empty, save the shared docid and accessToken locally, i.e. make them the default thoughtspace.
// if (tsidShared && accessTokenShared && tsidShared !== tsidLocal) {
//   const websocketProviderLocal = new WebsocketProvider(websocketUrl, tsidLocal, ydocLocal, {
//     auth: accessTokenLocal,
//   })
//   websocketProviderLocal.on('synced', (event: any) => {
//     const yThoughtIndexLocal = ydocLocal.getMap<ThoughtDb>('thoughtIndex')

//     // The root thought is not always loaded when synced fires. Maybe it is still propagating?
//     // Delaying helps but does not eliminate the issue.
//     // yThoughtIndexLocal.update will not be called with an empty thoughtspace.
//     // If a false positive occurs, the old thoughtspace will be lost (!!!)
//     // Maybe IndexedDB will help eliminate the possibility of a false positive?
//     setTimeout(() => {
//       const rootThought = yThoughtIndexLocal.get(HOME_TOKEN)
//       const isEmptyThoughtspace = rootThought && Object.keys(rootThought?.childrenMap || {}).length === 0
//       if (!isEmptyThoughtspace) return

//       // save shared access token and tsid as default
//       console.info('Setting shared thoughtspace as default')
//       storage.setItem('accessToken', accessTokenShared)
//       storage.setItem('tsid', tsidShared)

//       // backup tsid and accessToken just in case there is a false positive
//       storage.getItem('tsidBackup', tsidLocal)
//       storage.getItem('accessTokenBackup', accessTokenLocal)

//       // the welcome modal was disabled in initialState, but we still need to complete it so it doesn't appear again
//       storage.setItem('welcomeComplete')

//       // clear share params from URL without refreshing
//       window.history.pushState({}, '', '/')
//     }, 400)
//   })
// }
