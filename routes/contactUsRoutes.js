// routes/contactUsRoutes.js
import express from 'express';
import {
  createContact,
  getAllContacts,
  updateContact,
  deleteContact
} from '../Controllers/contactUsController.js';

const router = express.Router();

router.post('/contactus', createContact);       // POST
router.get('/contactus', getAllContacts);       // GET
router.put('/contactus/:id', updateContact);    // PUT
router.delete('/contactus/:id', deleteContact); // DELETE

export default router;
