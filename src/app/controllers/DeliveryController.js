import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { path } = req.route;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man does not exists' });
    }

    if (path === '/deliveryman/:id') {
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
}

export default new DeliveryController();
