import dbConfig from "../config/db";
import {HasManyGetAssociationsMixin, HasOneGetAssociationMixin} from "sequelize";

const Sequelize = require('sequelize');
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbConfig.sqlite.file
});

export class Profile extends Sequelize.Model {
    id: number;
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
    id: number;
    terms: string;
    status: 'new' | 'in_progress' | 'terminated';
    getJobs: HasManyGetAssociationsMixin<Job>;
    Client: Profile;
    ClientId: number;
    Contractor: Profile;
    ContractorId: number;
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
    id: number;
    description: string;
    price: number;
    paid: boolean;    
    paymentDate?: Date;
    getContract: HasOneGetAssociationMixin<Contract>;
    Contract?: Contract;
    ContractId: number;
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
