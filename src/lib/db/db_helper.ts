import jsonpack from 'jsonpack/main';

import { LogHelper } from '../debug';
import { FileHelper } from '../native';

type DBOpts = {
  readonly path: string;
  readonly logger?: LogHelper.ILogger;
  readonly compress?: boolean;
};

export type IDB<T> = {
  readonly init: () => Promise<void>;
  readonly insert: (row: T) => Promise<void>;
  readonly insertAll: (rows: readonly T[]) => Promise<void>;
  readonly replace: (rows: readonly T[]) => Promise<void>;
  readonly reset: () => Promise<void>;
  readonly filter: (cb: (row: T) => boolean) => Promise<readonly T[]>;
  readonly commit: () => Promise<void>;
  readonly data: () => readonly T[];
};

const DB = <Type>(opts: DBOpts): IDB<Type> => {
  const { logger } = opts;

  logger?.info(`Opening db`, opts.path);

  let db: readonly Type[] = [];

  return {
    /**
     * Initializes the db, in case of error and empty db will be initialized
     */
    async init() {
      try {
        const content = opts.compress
          ? (await FileHelper.readFile(opts.path)).toString()
          : await FileHelper.readJSONFile(opts.path);
        db = opts.compress ? jsonpack.unpack(content) : content;
      } catch (e) {
        console.log(e);
        logger?.debug("DB file doesn't exist, creating a new one", e);
        db = [];
      } finally {
        logger?.debug(`DB initializated, the DB contains ${db.length} records`);
      }
    },

    /**
     * Inserts a new row
     * @param row
     */
    async insert(row: Type) {
      logger?.debug('Insert new row', row);
      db = [...db, row];
    },

    /**
     * Inserts rows
     * @param rows
     */
    async insertAll(rows: readonly Type[]) {
      logger?.debug('Insert new row', rows);
      db = [...db, ...rows];
    },

    /**
     * Replaces current db
     * @param rows
     */
    async replace(rows: readonly Type[]) {
      logger?.debug('Insert new row', rows);
      db = rows;
    },

    /**
     * Resets the db
     */
    async reset() {
      logger?.debug('Reset db');
      db = [];
    },

    /**
     * Involkes the given `filterCallback` and remvove the filtered rows from the db
     * @param filterCallback
     */
    async filter(cb: (row: Type) => boolean) {
      logger?.debug('Filter rows');
      const filtered = db.filter(cb);

      logger?.debug(`Filterd ${db.length - filtered.length} rows`);
      db = filtered;
      return filtered;
    },

    /**
     * Saves the db to the fileSystem
     */
    async commit() {
      logger?.info('Commit changes');
      const content = opts.compress ? jsonpack.pack(db) : db;
      await FileHelper.writeFile(content, opts.path);
    },

    /**
     * Returns a copy of the data
     */
    data() {
      return [...db];
    },
  };
};

export default DB;
