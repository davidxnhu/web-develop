import {Component} from "@angular/core"

@Component({
  selector: "app-root",
/*   template: `
              <div>
                <h1>{{pageHeader}}</h1>
                <img src="{{imageUrl}}">
                <my-employee></my-employee>
              </div>
            ` */
  template: `
              <my-employee></my-employee>
            `
})

export class AppComponent{
  onClick(): void{
    console.log('Button clicked')
  }
}



/* import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Hello World';
} */


/*   
            <button class="colorClass" [class]="classesToApply">My button</button>
            <br/><br/>
            <button class="colorClass" [class.boldClass]="applyBoldClass">My button</button>
            <br/><br/>
            <button class="colorClass" [ngClass]="addClasses()">My button</button>
            <br><br>
            <button style='color:red' [style.font-weight]="isBold?'bold':'normal'">My button</button>
            <br><br>
            <button style='color:red' [ngStyle]="addStyles()">My button</button>




pageHeader : string = "Employee Details"
  imageUrl: string = "http://www.pragimtech.com/Images/Logo.JPG" */
/*   classesToApply: string = 'italicsClass boldClass';
  applyBoldClass: boolean = true;
  applyItalicsClass: boolean = true;

  addClasses(){
     let classes = {
       boldClass: this.applyBoldClass,
       italicsClass: this.applyItalicsClass
     };

     return classes;
  }

  fontSize: number = 30;
  isItalic: boolean = true;
  isBold: boolean = true;
  addStyles(){
    let styles = {
      'font-size.px': this.fontSize,
      'font-style': this.isItalic?'italic':'normal',
      'font-weight': this.isBold?'bold':'normal',
    };

    return styles;
  } */
