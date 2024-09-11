import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[delete-host]'
})
export class DeleteHostDirective implements AfterViewInit {

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    const host = this.el.nativeElement;
    const parent = host.parentNode;

    if (parent) {
      const fragment = document.createDocumentFragment();

      while (host.firstChild) {
        fragment.appendChild(host.firstChild);
      }

      parent.insertBefore(fragment, host);
      parent.removeChild(host);
    }
  }
}