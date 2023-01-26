import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { UserService } from './service/user.service';
import {MatDialog} from '@angular/material/dialog';
import { EditComponent } from './popup/edit/edit.component';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';

export interface UserData {
  id: string, 
  name: string, 
  age: string, 
  gender: string,
  email: string, 
  phone: string, 
  image: string, 
  companyName: string,
  address: string
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  pageSize: number[] = [5, 10, 25] 
  displayedColumns: string[] = [
    'id', 
    'name', 
    'age', 
    'gender',
    'email', 
    'phone', 
    'image', 
    'companyName',
    'address',
    'action'
  ];
  dataSource!: MatTableDataSource<UserData>;

  limit: number = 10;
  skip: number = 0;
  total: number = 0;
  isLoaded: boolean = false;
  searchTerms = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private userService: UserService, public dialog: MatDialog) {}

  ngOnInit(){
    this.searchSubscription = this.searchTerms
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        switchMap(searchText => {
          this.isLoaded = true
          this.skip = 0
          if(searchText.length>0){
            return this.userService.filterUsers(this.limit, this.skip, searchText)
          }else{
            return this.userService.getUsers(this.limit, this.skip)
          }
        })
      )
      .subscribe(
        (result:any) => {
          this.dataSource = new MatTableDataSource(result.users)
          this.total = result.total
        },
        error => alert(error),
        () => this.isLoaded = false
      );
      this.getUserList()
  }

  ngOnDestroy(){
    this.searchSubscription?.unsubscribe()
  }

  getUserList(){
    this.isLoaded = false
    this.userService.getUsers(this.limit, this.skip).subscribe(
      (userData:any) => {
        this.dataSource = new MatTableDataSource(userData.users)
        this.total = userData.total
      },
      error => alert(error),
      () => this.isLoaded = true
    )
  }
  
  
  applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    this.searchTerms.next(filterValue);
  }

  previousList(){
    if(this.skip>0){
      this.skip = this.skip - this.dataSource.data.length
      this.getUserList()
    }
  }

  nextList(){
    if(this.total-this.limit>this.skip){
      this.skip = this.dataSource.data.length + this.skip
      this.getUserList()
    }
  }

  refreshTable(limit: number){
    this.limit = limit;
    this.getUserList()
  }

  editUser(user: any){
    const dialogRef = this.dialog.open(EditComponent, {
      data: {
        user: user
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.userService.updateUser(result.user).subscribe(
          result => {
            alert(`User Updated Successfully!`)
            this.getUserList()
          },
          error => alert(error)
        )
      }
    });
  }

  deleteUser(userId: number){
    if(confirm(`Are you sure to delete this user: ${userId}`)){
      this.userService.deleteUser(userId).subscribe(
        result => {
          alert(`User Deleted Successfully!`)
          this.getUserList()
        },
        error => alert(error)
      )
    }
  }
}
