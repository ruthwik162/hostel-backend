// controllers/contactUsController.js
import { ContactUs } from '../models/ContactUs.js';

export const createContact = async (req, res) => {
  try {
    const { fullname, email, message } = req.body;
    const contact = new ContactUs({ fullname, email, message });
    await contact.save();
    res.status(200).json({ message: 'Contact submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit contact', error: err.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contacts', error: err.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ContactUs.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact updated', contact: updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactUs.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
