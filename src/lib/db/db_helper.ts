import { LogHelper } from '../debug';
import { FileHelper } from '../native';

type DBOpts = {
  readonly path: string;
  readonly logger?: LogHelper.ILogger;
};

export type IDB<T> = {
  readonly init: () => Promise<void>;
  readonly insert: (row: T) => Promise<void>;
  readonly reset: () => Promise<void>;
  readonly filter: (cb: (row: T) => boolean) => Promise<readonly T[]>;
  readonly commit: () => Promise<void>;
  readonly data: () => readonly T[];
};

const DB = <Type>(opts: DBOpts): IDB<Type> => {
  const { logger } = opts;

  logger?.info(`Opening db`, opts.path);

  let db: readonly Type[];

  return {
    /**
     * Initializes the db, in case of error and empty db will be initialized
     */
    async init() {
      try {
        db = await FileHelper.readJSONFile(opts.path);
      } catch (e) {
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
      await FileHelper.writeFile(db, opts.path);
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
