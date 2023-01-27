import { Injectable } from '@angular/core';
import { ISkill } from '../interfaces/avenger.models.interface';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  constructor(
    private clientService: ClientService,
  ) { }


  /** GET */


  get_skill_by_id(id: number | string) {
    return this.clientService.get<ISkill>(`/skills/${id}`);
  }


  get_skill_by_name(name: string) {
    return this.clientService.get<ISkill>(`/skills/name/${name}`);
  }


  get_skill_by_query(query: string) {
    return this.clientService.get<ISkill>(`/skills/query/${query}`);
  }


  get_users_by_skill_id(id: number | string) {
    return this.clientService.get<ISkill>(`/skills/${id}/users`);
  }





  /** POST */





  /** PUT */





  /** DELETE */




  
}









