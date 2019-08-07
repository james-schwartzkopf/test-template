import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-child',
  template: `child: {{prop}}`
})
export class ChildComponent {
  @Input() prop: number;
}

@Pipe({
  name: 'present',
  pure: true
})
export class PresentPipe<T> implements PipeTransform {
  transform(value: T | null | undefined): T {
    if (value === null || value === undefined) {
      throw new Error(`Expected value to be present`);
    }
    return value;
  }
}

@Component({
  selector: 'app-root',
  template:
  /* move closing comment to after '+' to compile and see solutions working */
  `
  <h1>The Problem</h1>
  <section>
    <!-- Must be built with strictNullChecks && enableIvy to see the errors below -->
    <ul>
      <!-- Type 'string[] | null' is not assignable to type 'string[] | Iterable<string> | undefined' -->
      <li *ngFor="let n of array$ | async">{{n}}</li>
    </ul>
    <!-- Type 'number | null' is not assignable to type 'number | undefined' -->
    <app-child [prop]="value$ | async"></app-child>
  </section>
  ` +
  `
  <h1>Solution 1 (non null assertions)</h1>
  <section>
    <!--
      This does fix the problem, but I don't like encouraging developers to throw
      the non null assertion operator around casually.  However, it is the shortest
      solution, meaning less noise when trying to understand the template.
    -->
    <ul>
      <li *ngFor="let n of (array$ | async)!">{{n}}</li>
    </ul>
    <app-child [prop]="(value$ | async)!"></app-child>
  </section>

  <h1>Solution 2 (use || to provide a default)</h1>
  <section>
    <!--
      This one is okay for ngFor, but I dislike it for the prop example.  It
      makes the type check pass, but undefined is still not a valid value for prop.
      Sometimes there's just not a good default value.
    -->
    <ul>
      <li *ngFor="let n of (array$ | async) || []">{{n}}</li>
    </ul>
    <!-- Passes type check, but prop shouldn't be set to undefined -->
    <app-child [prop]="(value$ | async) || undefined"></app-child>
    <!-- hmmm..., hope value$ isn't of(0) -->
    <app-child [prop]="(value$ | async) || 1"></app-child>
  </section>

  <h1>Solution 3 (use ngIf)</h1>
  <section>
    <!--
      This works okay for cases when async is actually expected to return null
      (i.e. the observable doesn't emit immediately), but doesn't work when
      the observable legitimately returns falsy (bool$ | async).  It can also
      lead to a lot of nested ng-container elements cluttering the template.
    -->
    <ng-container *ngIf="array$ | async as array">
      <ng-container *ngIf="value$ | async as value">
        <ul>
          <li *ngFor="let n of array">{{n}}</li>
        </ul>
        <!-- hmmm..., hope value$ isn't of(0) -->
        <app-child [prop]="value"></app-child>
      </ng-container>
    </ng-container>
  </section>

  <h1>Solution 4 (custom present pipe)</h1>
  <section>
    <!--
    This makes the templates longer than the non null assertion, and does have
    a small runtime overhead.  It also requires the developer to know/infer what
    the 'present' pipe does.

    I'm not sure if I like it more or less than the non null assertion, it does
    clutter up the template, but it's less likely to be abused.

    It doesn't handle the case when the observables don't emit imeadiately (in
    fact it causes a runtime error in that case), but those cases should be handled
    by one of the previous solutions anyway (|| default, ngIf, etc).
    -->
    <ul>
      <li *ngFor="let n of array$ | async | present">{{n}}</li>
    </ul>
    <app-child [prop]="value$ | async | present"></app-child>
  </section>
  `
})
export class AppComponent {
  array$ = of(['one', 'two', 'three']);
  value$ = of(1);
}
