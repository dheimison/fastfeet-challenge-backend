import { Op } from 'sequelize';
import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async show(req, res) {
    const { name } = req.query;

    if (name) {
      const recipient = await Recipient.findAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
        attributes: [
          'id',
          'name',
          'street',
          'number',
          'complement',
          'state',
          'city',
          'cep',
        ],
      });

      return res.status(200).json(recipient);
    }

    const recipients = await Recipient.findAll({
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });

    return res.status(200).json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data is missing' });
    }

    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'The recipient already exists' });
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      cep,
    } = await Recipient.create(req.body);

    return res.json({
      name,
      street,
      number,
      complement,
      state,
      city,
      cep,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      currentName: Yup.string().required(),
      newName: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      cep: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Please enter the current name' });
    }

    const { currentName, newName } = req.body;

    const recipient = await Recipient.findOne({
      where: { name: currentName },
    });

    if (!recipient) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (newName) {
      const newRecipient = await Recipient.findOne({
        where: { name: newName },
      });

      if (newRecipient) {
        return res.status(400).json({ error: 'The recipient already exists' });
      }
    }

    await recipient.update(req.body);

    return res.json({ Sucess: 'The recipient has been updated' });
  }
}

export default new RecipientController();
