import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

class DeliveryProblemController {
  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
    });
    return res.status(200).json(deliveries);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const deliveries = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      attributes: ['id', 'delivery_id', 'description'],
    });

    return res.status(200).json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      id: Yup.number().required(),
    });
    const { description } = req.body;
    const { id } = req.params;

    if (!(await schema.isValid({ description, id }))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const orderExists = await Order.findByPk(id);

    if (!orderExists) {
      return res.status(404).json({ error: 'Order does not exists' });
    }

    await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.status(200).json({ sucess: 'Problem registered' });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(404).json({ error: 'The problem does not exist' });
    }

    const orderId = problem.delivery_id;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (order.canceled_at) {
      return res
        .status(400)
        .json({ error: 'The order has already been canceled' });
    }

    await order.update({
      canceled_at: new Date(),
    });

    Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Uma entrega foi cancelada',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        product: order.product,
        horary: format(
          order.canceled_at,
          "'Dia' dd 'de' MMMM 'de' yyyy', às ' HH:mm'h'",
          { locale: pt }
        ),
      },
    });

    return res.status(200).json(order);
  }
}

export default new DeliveryProblemController();
