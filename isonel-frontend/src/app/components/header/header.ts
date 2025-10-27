import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() readonly menuToggled = new EventEmitter<boolean>();
  menuAberto = false;

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    this.menuToggled.emit(this.menuAberto);
  }

  closeMenu(): void {
    if (!this.menuAberto) {
      return;
    }

    this.menuAberto = false;
    this.menuToggled.emit(this.menuAberto);
  }
}
