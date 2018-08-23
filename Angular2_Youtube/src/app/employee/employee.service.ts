import {Injectable} from '@angular/core';
import {IEmployee} from './employee';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

@Injectable()
export class EmployeeService {

    constructor(private _http: Http){

    }


    getEmployees(): IEmployee[]{
        return [
            {code: 'emp101', name:'Tom', gender: 'Male', annualSalary: 5500, dateOfBirth: '6/25/1988'},
            {code: 'emp102', name:'Alex', gender: 'Male', annualSalary: 5700, dateOfBirth: '6/9/1982'},
            {code: 'emp103', name:'Mike', gender: 'Male', annualSalary: 5900, dateOfBirth: '8/12/1979'},
            {code: 'emp104', name:'Mary', gender: 'Female', annualSalary: 6500, dateOfBirth: '10/14/1980'},
            {code: 'emp105', name:'Nancy', gender: 'Female', annualSalary: 6770.826,dateOfBirth: '11/18/1979'}
            ];
    }

    getEmployeeByCode(empCode:string):IEmployee{
        var employees=this.getEmployees();
        for (var i=0;i<employees.length;i++){
            if(employees[i].code==empCode){
                return employees[i];
            }
        }

        return null;
    }

/*     getEmployees(): Observable<IEmployee[]> {
        return this._http.get("http://localhost:31324/api/employeess")
            .map((response: Response) => <IEmployee[]>response.json())
            .catch(this.handleError);
    } 
        getEmployeeByCode(empCode:string):Observable<IEmployee>{
            return this._http.get("http://localhost:31324/api/employeess" + empCode)
            .map((response: Response) => <IEmployee[]>response.json())
            .catch(this.handleError);
        }
    
    
    */

    handleError(error: Response){
        console.error(error);
        return Observable.throw(error)
    }
}