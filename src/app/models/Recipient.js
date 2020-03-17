import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        newName: Sequelize.VIRTUAL,
        street: Sequelize.STRING,
        number: Sequelize.STRING,
        complement: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        cep: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', recipient => {
      if (recipient.newName) {
        recipient.name = recipient.newName;
      }
    });

    return this;
  }
}

export default Recipient;
