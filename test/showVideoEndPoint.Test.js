const knex = require('knex');
const app = require('../src/app');
const makeVideosArray = require('./videos-fixtures');

// this is to test showing the artwork

describe('Show All Videos Endpoint', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  beforeEach('cleanup', () => db('videos').truncate());

  afterEach('cleanup', () => db('videos').truncate());

  describe('GET api/videos', () => { 

    context('Given no videos', () => {
      it('responds with 200 and an empty list', () => supertest(app)
        .get('/api/videos')
        .expect(200, []));
    });

    context('Given there are videos in the database', () => {
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => db
        .into('videos')
        .insert(testVideos));

      it('responds with 200 and the videos', () => supertest(app)
        .get('/api/videos')
        .expect(200, testVideos));
    });

    })
  });
});