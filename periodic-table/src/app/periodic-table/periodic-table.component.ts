import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { RxState } from '@rx-angular/state';

export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

interface State {
  elements: PeriodicElement[];
  filteredElements: PeriodicElement[];
  filterValue: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [RxState],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.scss'
})
export class PeriodicTableComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'edit'];
  filterControl = new FormControl();

  constructor(
    public state: RxState<State>,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.state.set({
      elements: ELEMENT_DATA,
      filteredElements: ELEMENT_DATA,
      filterValue: ''
    });

    this.state.connect(
      'filterValue',
      this.filterControl.valueChanges.pipe(debounceTime(2000))
    );

    this.state.connect(
      'filteredElements',
      this.state.select('filterValue').pipe(
        map(filterValue => this.filterElements(filterValue))
      )
    );
  }

  private filterElements(filterValue: string): PeriodicElement[] {
    const lowerCaseFilter = filterValue?.toLowerCase() || '';
    return this.state.get('elements').filter((element) =>
      Object.values(element).some(value =>
        value.toString().toLowerCase().includes(lowerCaseFilter)
      )
    );
  }

  openEditDialog(element: PeriodicElement): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '250px',
      data: { ...element }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateElement(result);
      }
    });
  }

  updateElement(updatedElement: PeriodicElement): void {
    const elements = this.state.get('elements').map(element =>
      element.position === updatedElement.position ? updatedElement : element
    );
    this.state.set({ elements });
    this.state.set({ filteredElements: this.filterElements(this.state.get('filterValue')) });
  }
}
