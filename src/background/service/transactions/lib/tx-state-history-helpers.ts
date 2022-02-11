import jsonDiffer from 'fast-json-patch';
import { cloneDeep } from 'lodash';
import { Transaction } from '../typing';
type TransactionMeta = Transaction;
/**
  converts non-initial history entries into diffs
  @param {Array} longHistory
  @returns {Array}
*/
export function migrateFromSnapshotsToDiffs(longHistory: any[]) {
  return (
    longHistory
      // convert non-initial history entries into diffs
      .map((entry, index) => {
        if (index === 0) {
          return entry;
        }
        return generateHistoryEntry(longHistory[index - 1], entry);
      })
  );
}

/**
  Generates an array of history objects sense the previous state.
  The object has the keys
    op (the operation performed),
    path (the key and if a nested object then each key will be separated with a `/`)
    value
  with the first entry having the note and a timestamp when the change took place
  @param previousState - the previous state of the object
  @param newState - the update object
  @param [note] - a optional note for the state change
  @returns {Array}
*/
export function generateHistoryEntry(
  previousState: any,
  newState: any,
  note?: string
) {
  const entry = jsonDiffer.compare(previousState, newState);
  // Add a note to the first op, since it breaks if we append it to the entry
  if (entry[0]) {
    if (note) {
      (entry[0] as any).note = note;
    }

    (entry[0] as any).timestamp = Date.now();
  }
  return entry;
}

/**
  Recovers previous txMeta state obj
  @returns {Object}
*/
export function replayHistory(_shortHistory: any[]) {
  const shortHistory = cloneDeep(_shortHistory);
  return shortHistory.reduce(
    (val, entry) => jsonDiffer.applyPatch(val, entry).newDocument
  );
}

/**
 * Snapshot {@code txMeta}
 * @param txMeta - the tx metadata object
 * @returns a deep clone without history
 */
export function snapshotFromTxMeta(txMeta: TransactionMeta): TransactionMeta {
  const shallow = { ...txMeta };
  shallow.history = [];
  return cloneDeep(shallow);
}
