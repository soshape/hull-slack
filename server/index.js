import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { NotifHandler } from 'hull';
import updateUser from './update-user';
import updateSegment from './update-segment';
import Slack from 'node-slack';

const handler = NotifHandler({
  onSubscribe() {
    console.warn('Hello new subscriber !');
  },
  events: {
    'user_report:update': updateUser,
    'users_segment:update': updateSegment
  }
});

const readmeRedirect = function (req, res) {
  res.redirect(`https://dashboard.hullapp.io/readme?url=https://${req.headers.host}`);
};

module.exports = function (config = {}) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/notify', handler);

  app.get('/test', function(req, res){
    new Slack("https://hooks.slack.com/services/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").send({
      text: "ceci est un test Mofo",
      channel: "#newchannel",
    });
    res.send('Hello ma poule');
  });

  app.use(express.static(path.resolve(__dirname, '..', 'dist')));
  app.use(express.static(path.resolve(__dirname, '..', 'assets')));

  app.get('/', readmeRedirect);
  app.get('/readme', readmeRedirect);

  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'manifest.json'));
  });

  app.listen(config.port);

  console.log(`Started on port ${config.port}`);

  return app;
};
