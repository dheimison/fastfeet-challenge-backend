import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import fs from 'fs';
import { resolve } from 'path';
import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { path } = req.route;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man does not exists' });
    }

    if (path === '/deliveries/:id') {
      const order = await Order.findAll({
        where: { deliveryman_id: id, canceled_at: null, end_date: null },
      });

      if (!order) {
        return res.status(404).json({
          error: 'There are no deliveries available for this delivery man',
        });
      }

      return res.status(200).json(order);
    }

    const completedDeliveries = await Order.findAll({
      where: {
        deliveryman_id: id,
        end_date: {
          [Op.ne]: null,
        },
      },
    });

    if (!completedDeliveries) {
      return res
        .status(404)
        .json({ error: 'There are no orders delivered by this delivery man' });
    }

    return res.status(200).json(completedDeliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.string().required(),
      order_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, order_id } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, deliveryman_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.start_date) {
      return res.status(401).json({ error: 'Order already withdrawn' });
    }

    const date = new Date();
    const eightHours = setSeconds(setMinutes(setHours(date, 8), 0), 0);
    const eighteenHours = setSeconds(setMinutes(setHours(date, 18), 0), 0);

    if (date < eightHours || date > eighteenHours) {
      return res.status(401).json({ error: 'Outside opening hours' });
    }

    const deliveryAvailable = await Order.findAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    if (deliveryAvailable.length >= 5) {
      return res.status(403).json({ error: 'Delivery limit reached' });
    }

    await order.update({
      start_date: date,
    });

    return res.status(200).json({ Success: 'Order withdrawn' });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
      order_id: Yup.string().required(),
    });

    const { id } = req.params;
    const { order: order_id } = req.query;

    if (!req.file) {
      return res.status(400).json({ error: 'Signature photo is required' });
    }

    function deleteFile() {
      const filePath = resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        `${req.file.filename}`
      );
      fs.unlinkSync(filePath);
    }

    if (!(await schema.isValid({ id, order_id }))) {
      deleteFile();
      return res.status(400).json({ error: 'Validations fails' });
    }

    const order = await Order.findOne({
      where: { id: order_id, deliveryman_id: id },
    });

    if (!order) {
      deleteFile();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.end_date) {
      deleteFile();
      return res.status(401).json({ error: 'Order already delivered' });
    }

    const { originalname, filename: path } = req.file;

    const file = await File.create({
      name: originalname,
      path,
    });

    await order.update({
      signature_id: file.id,
      end_date: new Date(),
    });

    return res.status(200).json({ Success: 'Confirmed delivery' });
  }
}

export default new DeliveryController();
