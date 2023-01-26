import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debounce, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  /*
  1. https://dummyjson.com/docs/users (All API details are given on this URL)
  2. https://dummyjson.com/users (GET, Get All Users)
  3. https://dummyjson.com/users/1 (GET, Get A Single User)
  4. https://dummyjson.com/users/filter? (GET, Filter Users)
  5. https://dummyjson.com/users?limit=5&skip=10 (GET, Limit And Skip Users)
  6. https://dummyjson.com/users/1 (PUT, Update A User)
  7. https://dummyjson.com/users/1 (DELETE, Delete A User)
  */

  constructor(private http: HttpClient) { }

  getUsers(limit: number, skip: number){
    return this.http.get(`https://dummyjson.com/users?limit=${limit}&skip=${skip}`)
  }
  getUser(userId: number){
    return this.http.get(`https://dummyjson.com/users/${userId}`)
  }
  filterUsers(limit: number, skip: number, filterValue: string){
    return this.http.get(`https://dummyjson.com/users/filter?limit=${limit}&skip=${skip}&key=firstName&value=${filterValue}`)
    .pipe(debounce(() => timer(10000)))
  }
  updateUser(userData: any){ console.log(userData)
    return this.http.put(
      `https://dummyjson.com/users/${userData.id}`,
      userData
      )
  }
  deleteUser(userId: number){
    return this.http.delete(`https://dummyjson.com/users/${userId}`)
  }

}
