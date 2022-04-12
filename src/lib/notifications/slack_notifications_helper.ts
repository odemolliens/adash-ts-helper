import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';

import { INotificator } from './notifications_helper';

type SlackNotificatorOpts = {
  readonly webhookURL: string;
  readonly username?: string;
};

const SlackNotificator = (opts?: SlackNotificatorOpts): INotificator => {
  return {
    /**
     * Notifies the Slack channel
     *
     * Based on https://api.slack.com/messaging/webhooks
     * and Block Kit builder https://app.slack.com/block-kit-builder/
     *
     * @param title
     * @param message
     */
    async notify(title: string, message: string) {
      logger().debug(`Notify Slack channel:\n   > ${title}\n   > ${message}`);

      const card = {
        username: opts.username,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: title,
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: message,
              emoji: true,
            },
          },
        ],
      };

      const { data } = await NetworkHelper.post(opts.webhookURL, card);
      return data;
    },
  };
};

export default SlackNotificator;
