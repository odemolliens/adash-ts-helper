import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { INotificator } from './notifications_helper';

type TeamsNotificatorOpts = {
  readonly webhookURL: string;
};

const TeamsNotificator = (opts?: TeamsNotificatorOpts): INotificator => {
  return {
    /**
     * Notifies the Teams channel
     *
     * Based on https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#send-a-message-through-incoming-webhook-or-office-365-connector
     * Card Designer https://amdesigner.azurewebsites.net
     * @param title
     * @param message
     */
    async notify(title: string, message: string) {
      logger().debug(`Notify Teams channel:\n   > ${title}\n   > ${message}`);

      const card = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7',
        summary: title,
        sections: [
          {
            activityTitle: title,
            activitySubtitle: message,
          },
        ],
      };

      const { data } = await NetworkHelper.post(opts.webhookURL, card);
      return data;
    },
  };
};

export default TeamsNotificator;
