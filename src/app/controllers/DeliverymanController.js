import { Op } from 'sequelize';
import * as Yup from 'yup';
import fs from 'fs';
import { resolve } from 'path';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { name } = req.query;

    if (name) {
      const deliveryman = await Deliveryman.findAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
        attributes: ['id', 'name', 'email', 'avatar_id'],
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['name', 'path', 'url'],
          },
        ],
      });

      return res.status(200).json(deliveryman);
    }

    const deliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.status(200).json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, email } = req.body;

    const deliverymanExists = await Deliveryman.findOne({
      where: { email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Delivery man already exists.' });
    }

    if (req.file) {
      const { originalname, filename: path } = req.file;

      const file = await File.create({
        name: originalname,
        path,
      });

      const deliveryman = await Deliveryman.create({
        name,
        email,
        avatar_id: file.id,
      });

      return res.status(200).json({ deliveryman });
    }

    const deliveryman = await Deliveryman.create({
      name,
      email,
    });

    return res.json({ deliveryman });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man does not exists' });
    }

    if (email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(401).json({ error: 'Delivery man already exists.' });
      }
    }

    if (req.file) {
      const { originalname, filename: path } = req.file;

      const avatar = await File.findOne({
        where: { id: deliveryman.avatar_id },
      });

      if (avatar) {
        const filePath = resolve(
          __dirname,
          '..',
          '..',
          '..',
          'tmp',
          'uploads',
          `${avatar.path}`
        );

        fs.unlinkSync(filePath);

        const { url } = await avatar.update({
          name: originalname,
          path,
        });

        const { id, name } = await deliveryman.update(req.body);

        return res.status(200).json({ id, name, email, url });
      }

      const file = await File.create({
        name: originalname,
        path,
      });

      const { id, name } = await deliveryman.update({
        name: req.body.name,
        email,
        avatar_id: file.id,
      });

      return res.status(200).json({ id, name, email, url: file.url });
    }

    const { id, name } = await deliveryman.update(req.body);

    return res.status(200).json({ id, name, email });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'avatar_id'],
    });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man does not exists' });
    }

    if (deliveryman.avatar_id) {
      const avatar = await File.findByPk(deliveryman.avatar_id);
      const filePath = resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        `${avatar.path}`
      );

      fs.unlinkSync(filePath);
      avatar.destroy();
    }

    await deliveryman.destroy();

    return res.status(200).json({ Success: 'Delivery man deleted' });
  }
}

export default new DeliverymanController();
