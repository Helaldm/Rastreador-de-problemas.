'use strict';

const mongoose = require('mongoose');

// Define Issue Schema
const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: { type: String, required: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {
  // GET issues
  app.route('/api/issues/:project')
    .get(async function(req, res) {
      const project = req.params.project;
      let filters = req.query || {};
      filters.project = project;
      try {
        const issues = await Issue.find(filters).select('-__v -project');
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // POST issue
    .post(async function(req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      try {
        const issue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          project
        });
        await issue.save();
        let obj = issue.toObject();
        delete obj.__v;
        delete obj.project;
        res.json(obj);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // PUT update issue
    .put(async function(req, res) {
      const project = req.params.project;
      const { _id, ...fields } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });

      // Remove empty fields and special fields
      let updateFields = {};
      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined && fields[key] !== '') {
          updateFields[key] = fields[key];
        }
      });

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updateFields.updated_on = new Date();

      try {
        const updated = await Issue.findOneAndUpdate(
          { _id, project },
          updateFields,
          { new: true }
        );
        if (!updated) return res.json({ error: 'could not update', _id });
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    // DELETE issue
    .delete(async function(req, res) {
      const project = req.params.project;
      const { _id } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });
      try {
        const deleted = await Issue.findOneAndDelete({ _id, project });
        if (!deleted) return res.json({ error: 'could not delete', _id });
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
