import {deflate} from "zlib";
import {HasManyGetAssociationsMixin, HasOneGetAssociationMixin} from "sequelize";

const Sequelize = require('sequelize');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3'
});

export class Profile extends Sequelize.Model {
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: 'client' | 'contractor';    
}

Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

export class Contract extends Sequelize.Model {
    terms: string;
    status: 'new' | 'in_progress' | 'terminated';
    getJobs: HasManyGetAssociationsMixin<Job>;
    Client?: Profile;
    Contractor?: Profile;
}

Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

export class Job extends Sequelize.Model {
    description: string;
    price: number;
    paid: boolean;
    paymentDate: Date;
    getContract: HasOneGetAssociationMixin<Contract>;
    Contract?: Contract;
}

Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price:{
      type: Sequelize.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default:false
    },
    paymentDate:{
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'});
Contract.belongsTo(Profile, {as: 'Contractor'});
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'});
Contract.belongsTo(Profile, {as: 'Client'});
Contract.hasMany(Job);
Job.belongsTo(Contract);