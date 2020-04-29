import { Op } from 'sequelize';
import * as Yup from 'yup';
import fs from 'fs';
import { resolve } from 'path';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const { order } = req.query;

    if (order) {
      const Orders = await Order.findAll({
        where: {
          product: { [Op.iLike]: order },
        },
        attributes: [
          'id',
          'product',
          'canceled_at',
          'start_date',
          'end_date',
          'signature_id',
        ],
        include: [
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['id', 'name', 'email', 'avatar_id'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['id', 'name'],
          },
          {
            model: File,
            as: 'signature',
            attributes: ['name', 'path'],
          },
        ],
      });

      return res.status(200).json(Orders);
    }

    const Orders = await Order.findAll({
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'signature_id',
      ],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email', 'avatar_id'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path'],
        },
      ],
    });

    return res.status(200).json(Orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient man does not exist' });
    }

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exist' });
    }

    Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda disponível',
      template: 'creation',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        product,
      },
    });

    const newOrder = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.status(200).json(newOrder);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    const { deliveryman_id, recipient_id } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    if (!req.params.id) {
      return res.status(400).json({ error: 'Please enter the ID' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order does not exist' });
    }

    if (recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);

      if (!recipientExists) {
        return res.status(404).json({ error: 'Recipient does not exist' });
      }
    }

    if (deliveryman_id) {
      const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExists) {
        return res.status(404).json({ error: 'Delivery man does not exist' });
      }
    }

    await order.update(req.body);

    return res.status(200).json({ Sucess: 'The order has been updated' });
  }

  async delete(req, res) {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Please enter the ID' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order does not exist' });
    }

    if (order.signature_id) {
      const signature = await File.findByPk(order.signature_id);

      const filePath = resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        `${signature.path}`
      );

      fs.unlinkSync(filePath);
      signature.destroy();
    }
    await order.destroy();

    return res.status(200).json({ Sucess: 'Order deleted' });
  }
}

export default new OrderController();
