// Connects each URL + HTTP method to a controller function.
const express = require('express');
const controller = require('../controllers/opportunityController');

const router = express.Router();

router.post('/', controller.createOpportunity);        // Create
router.get('/', controller.getAllOpportunities);       // Read all
router.get('/:id', controller.getOpportunityById);     // Read one
router.put('/:id', controller.updateOpportunity);      // Update
router.delete('/:id', controller.deleteOpportunity);   // Delete

module.exports = router;
