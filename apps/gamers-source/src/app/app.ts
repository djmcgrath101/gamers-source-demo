import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'gs-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
