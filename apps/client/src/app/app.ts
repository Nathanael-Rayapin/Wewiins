import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, Sidebar, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
