import _ from 'lodash';
import Slack from 'node-slack';
import transform from './lib/transform';
import cache from './lib/cache';
import { getUserName, formatAttachments, userUrl } from './lib/formatters';

function log(err) {
  console.log(err);
}

const blacklist = [
  'has_done',
  'invited_by_id',
  'sign_up_url',
  'has_password',
  'is_approved',
  'has_confirmed_email',
  'is_admin'
];

function flatten(arr, n) {
  return _.map(arr, (i) => {
    return i[n] || '';
  }).join(', ');
}

export default function (notification = {}, context = {}) {
  const { hull, ship } = context;
  const { user, segments } = notification.message;

  if (!user || !user.id || !ship || !ship.settings) { log('Nothing Muffin');return false; }
  const s = flatten(segments, 'name');
  log(s);
  log("attribut");
  log(ship.settings.segment);
  if ( s.indexOf(ship.settings.segment) == -1) {return false;}
  log("OK");

  cache(ship.id, '/search/user_reports/bootstrap', hull).then((properties) => {
    const url = userUrl(user, hull.configuration().orgUrl);
    const name = getUserName(user);
    const attachments = transform({
      format: formatAttachments,
      blacklist,
      properties,
      user
    });

    if (s) {
      attachments.push({
        title: 'Segments',
        color: '#ff9df2',
        text: s
      });
    }
    new Slack(ship.settings.hook_url).send({
      ..._.omit(ship.settings, 'hook_url'),
      text: `<${url}|${name}> Updated`,
      unfurl_links: true,
      attachments
    });
  }, log).catch(log);
}
