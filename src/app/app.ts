import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Header } 
// import { Footer } from "";
// agregarlas a import

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
