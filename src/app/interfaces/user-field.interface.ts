
import { IUser } from './avenger.models.interface';
import { ICommonModel } from './common.interface';

export interface IUserField extends ICommonModel {
  id: number;
  user_id: number;
  fieldname: string;
  fieldtype: string;
  fieldvalue: string;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  //
  user?: IUser;
}
