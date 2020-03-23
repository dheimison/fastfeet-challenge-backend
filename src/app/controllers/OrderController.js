import * as Yup from 'yup';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Mail from '../../lib/Mail';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient: Yup.number().required(),
      deliveryman: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const {
      recipient: recipient_id,
      deliveryman: deliveryman_id,
      product,
    } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    const recipient = await Recipient.findByPk(recipient_id);

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
}

export default new OrderController();
