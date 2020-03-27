import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

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
}

export default new DeliveryProblemController();
