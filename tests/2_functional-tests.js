const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {
  // POST with every field
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'User',
        assigned_to: 'Assignee',
        status_text: 'Status'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'User');
        assert.equal(res.body.assigned_to, 'Assignee');
        assert.equal(res.body.status_text, 'Status');
        assert.property(res.body, '_id');
        testId = res.body._id;
        done();
      });
  });

  // POST with only required fields
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title2',
        issue_text: 'Text2',
        created_by: 'User2'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title2');
        assert.equal(res.body.issue_text, 'Text2');
        assert.equal(res.body.created_by, 'User2');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.property(res.body, '_id');
        done();
      });
  });

  // POST missing required fields
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title3'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // GET all issues
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // GET with a filter
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ created_by: 'User' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => assert.equal(issue.created_by, 'User'));
        done();
      });
  });

  // GET with multiple filters
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ issue_title: 'Title', created_by: 'User' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.issue_title, 'Title');
          assert.equal(issue.created_by, 'User');
        });
        done();
      });
  });

  // PUT update one field
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_text: 'Updated text' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // PUT update multiple fields
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'Updated title', issue_text: 'Updated text2' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // PUT missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_text: 'No id' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // PUT no fields to update
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // PUT invalid _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalidid', issue_text: 'fail update' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // DELETE an issue
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // DELETE invalid _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidid' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // DELETE missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
