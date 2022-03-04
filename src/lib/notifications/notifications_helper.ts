import { simpleLogger as logger } from '../debug';

export type INotificator = {
  readonly notify: (title: string, message: string) => Promise<unknown>;
};

// eslint-disable-next-line functional/no-let
let notificators = [];

export const register = (notificator: INotificator) => {
  if (!notificators.includes(notificator)) {
    notificators.push(notificator);
  }
};

export const registerMultiple = (notificatorList: readonly INotificator[]) => {
  notificatorList.forEach(register);
};

export const remove = (notificator: INotificator) => {
  notificators = notificators.filter((n) => n !== notificator);
};

export const notify = async (title: string, message: string) => {
  if (notificators.length === 0) {
    logger().error("Can't deliver the message, no notificators registered!");
  }

  // eslint-disable-next-line functional/no-loop-statement
  for (const n of notificators) {
    await n.notify(title, message);
  }
};
