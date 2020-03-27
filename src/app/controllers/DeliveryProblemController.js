import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll();
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
    });

    return res.status(200).json(deliveries);
  }
}

export default new DeliveryProblemController();
